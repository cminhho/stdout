/**
 * JSON validation (RFC 8259), formatting, and stats. Single place for JSON tool logic.
 */

import type { ParseError } from "@/utils/validationTypes";

export type JsonIndentOption = 2 | 3 | 4 | 8 | "tab" | "minified";

/** @deprecated Use ParseError from @/utils/validationTypes */
export type ValidationError = ParseError;

export interface JsonProcessResult {
  output: string;
  errors: ParseError[];
  stats: { keys: number; depth: number; arrays: number; objects: number; size: string } | null;
  isValid: boolean | null;
  parsedData: unknown;
}

function getPosition(input: string, pos: number) {
  let line = 1,
    col = 1;
  for (let i = 0; i < pos && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      col = 1;
    } else {
      col++;
    }
  }
  return { line, col };
}

function getSnippet(lines: string[], lineNum: number) {
  const l = lines[lineNum - 1] || "";
  return l.length > 80 ? l.slice(0, 80) + "…" : l;
}

function strictValidateJson(input: string): { valid: boolean; errors: ParseError[]; parsed?: unknown } {
  const errors: ParseError[] = [];
  const lines = input.split("\n");

  const trailingCommaRegex = /,\s*([}\]])/g;
  let match;
  while ((match = trailingCommaRegex.exec(input)) !== null) {
    const pos = getPosition(input, match.index);
    errors.push({
      line: pos.line,
      column: pos.col,
      message: "Trailing comma before closing bracket/brace",
      snippet: getSnippet(lines, pos.line),
    });
  }

  const stripped = input.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  const singleQuoteRegex = /(?<!")'\s*[^']*'\s*(?!["\\])/g;
  let sqMatch;
  while ((sqMatch = singleQuoteRegex.exec(stripped)) !== null) {
    const pos = getPosition(input, sqMatch.index);
    errors.push({
      line: pos.line,
      column: pos.col,
      message: 'Single quotes are not valid in JSON. Use double quotes (")',
      snippet: getSnippet(lines, pos.line),
    });
  }

  const unquotedKeyRegex = /(?:^|[{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/gm;
  let ukMatch;
  while ((ukMatch = unquotedKeyRegex.exec(stripped)) !== null) {
    if (!["true", "false", "null"].includes(ukMatch[1])) {
      const pos = getPosition(input, ukMatch.index + ukMatch[0].indexOf(ukMatch[1]));
      errors.push({
        line: pos.line,
        column: pos.col,
        message: `Unquoted key "${ukMatch[1]}". Keys must be wrapped in double quotes`,
        snippet: getSnippet(lines, pos.line),
      });
    }
  }

  const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
  let cmMatch;
  while ((cmMatch = commentRegex.exec(stripped)) !== null) {
    const pos = getPosition(input, cmMatch.index);
    errors.push({
      line: pos.line,
      column: pos.col,
      message: "Comments are not allowed in JSON",
      snippet: getSnippet(lines, pos.line),
    });
  }

  try {
    const parsed = JSON.parse(input);
    return { valid: errors.length === 0, errors, parsed };
  } catch (e) {
    const msg = (e as Error).message;
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = getPosition(input, Number(posMatch[1]));
      errors.push({
        line: pos.line,
        column: pos.col,
        message: msg.replace(/^JSON\.parse:\s*/i, "").replace(/^Unexpected/i, "Unexpected"),
        snippet: getSnippet(lines, pos.line),
      });
    } else {
      const lineMatch = msg.match(/line\s+(\d+)/i);
      const colMatch = msg.match(/column\s+(\d+)/i);
      errors.push({
        line: lineMatch ? Number(lineMatch[1]) : 1,
        column: colMatch ? Number(colMatch[1]) : 1,
        message: msg,
        snippet: getSnippet(lines, lineMatch ? Number(lineMatch[1]) : 1),
      });
    }
    return { valid: false, errors };
  }
}

function computeStats(parsed: unknown): { keys: number; depth: number; arrays: number; objects: number; size: string } {
  let keys = 0,
    depth = 0,
    arrays = 0,
    objects = 0;
  const walk = (v: unknown, d: number) => {
    if (d > depth) depth = d;
    if (Array.isArray(v)) {
      arrays++;
      v.forEach((item) => walk(item, d + 1));
    } else if (v !== null && typeof v === "object") {
      objects++;
      const entries = Object.entries(v as Record<string, unknown>);
      keys += entries.length;
      entries.forEach(([, val]) => walk(val, d + 1));
    }
  };
  walk(parsed, 0);
  const bytes = new TextEncoder().encode(JSON.stringify(parsed)).length;
  const size =
    bytes < 1024
      ? `${bytes} B`
      : bytes < 1048576
        ? `${(bytes / 1024).toFixed(1)} KB`
        : `${(bytes / 1048576).toFixed(1)} MB`;
  return { keys, depth, arrays, objects, size };
}

function indentToSpace(indent: JsonIndentOption): string | number | undefined {
  if (indent === "minified") return undefined;
  if (indent === "tab") return "\t";
  return indent;
}

/** Validate, format, and compute stats in one pass. */
export function processJsonInput(input: string, indent: JsonIndentOption): JsonProcessResult {
  const empty = {
    output: "",
    errors: [] as ParseError[],
    stats: null,
    isValid: null,
    parsedData: undefined as unknown,
  };
  if (!input.trim()) return empty;

  const result = strictValidateJson(input);
  if (!result.parsed || result.errors.length > 0) {
    return {
      output: "",
      errors: result.errors,
      stats: null,
      isValid: false,
      parsedData: undefined as unknown,
    };
  }

  const data = result.parsed;
  const space = indentToSpace(indent);
  const formatted = JSON.stringify(data, null, space);
  const minified = JSON.stringify(data);
  return {
    output: indent === "minified" ? minified : formatted,
    errors: result.errors,
    stats: computeStats(data),
    isValid: result.valid,
    parsedData: data,
  };
}
