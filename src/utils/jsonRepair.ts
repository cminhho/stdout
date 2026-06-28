/**
 * Relaxed JSON repair: normalize common pasted JSON-like text into strict JSON.
 */

import { parse as parseYaml } from "yaml";
import type { ParseError } from "@/utils/validationTypes";

export type JsonRepairIndent = 2 | 4 | 8 | "tab" | "minified";

export interface JsonRepairResult {
  output: string;
  errors: ParseError[];
  operations: string[];
  repaired: boolean;
}

interface TransformResult {
  text: string;
  changed: boolean;
}

export const JSON_REPAIR_FILE_ACCEPT = ".json,.jsonc,.txt,application/json,text/plain";
export const JSON_REPAIR_OUTPUT_FILENAME = "repaired.json";
export const JSON_REPAIR_MIME_TYPE = "application/json";
export const JSON_REPAIR_INPUT_PLACEHOLDER = "Paste relaxed JSON, JSONC, or JSON-like object text...";
export const JSON_REPAIR_OUTPUT_PLACEHOLDER = "Strict JSON will appear here...";

export const JSON_REPAIR_SAMPLE_RELAXED = `{
  // user payload copied from a debug log
  id: 'usr_123',
  email: 'admin@example.com',
  active: True,
  roles: ['admin', 'editor',],
  metadata: {
    source: 'dashboard',
    lastLogin: undefined,
  },
}`;

export const JSON_REPAIR_SAMPLE_CONFIG = `{
  appName: 'stdout',
  features: {
    openTabs: true,
    betaTools: false,
  },
  retries: 3,
  endpoints: [
    'https://api.example.com/users',
    'https://api.example.com/admin',
  ],
}`;

function indentToSpace(indent: JsonRepairIndent): string | number | undefined {
  if (indent === "minified") return undefined;
  if (indent === "tab") return "\t";
  return indent;
}

function getPosition(input: string, position: number) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < position && i < input.length; i++) {
    if (input[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function getSnippet(input: string, line: number): string {
  const text = input.split("\n")[line - 1] ?? "";
  return text.length > 100 ? `${text.slice(0, 100)}...` : text;
}

function toParseError(input: string, error: unknown): ParseError {
  const message = error instanceof Error ? error.message : String(error);
  const positionMatch = message.match(/position\s+(\d+)/i);
  if (positionMatch) {
    const { line, column } = getPosition(input, Number(positionMatch[1]));
    return { line, column, message, snippet: getSnippet(input, line) };
  }

  const line = Number(message.match(/line\s+(\d+)/i)?.[1] ?? 1);
  const column = Number(message.match(/column\s+(\d+)/i)?.[1] ?? 1);
  return { line, column, message, snippet: getSnippet(input, line) };
}

function tryParseJson(input: string): { ok: true; value: unknown } | { ok: false; error: ParseError } {
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (error) {
    return { ok: false, error: toParseError(input, error) };
  }
}

function formatJson(value: unknown, indent: JsonRepairIndent): string {
  return JSON.stringify(value, null, indentToSpace(indent));
}

function stripBom(input: string): TransformResult {
  return input.charCodeAt(0) === 0xfeff
    ? { text: input.slice(1), changed: true }
    : { text: input, changed: false };
}

function copyQuotedString(input: string, start: number): { text: string; end: number } {
  const quote = input[start];
  let out = quote;
  let i = start + 1;
  let escaped = false;
  while (i < input.length) {
    const char = input[i];
    out += char;
    i++;
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === quote) break;
  }
  return { text: out, end: i };
}

function stripComments(input: string): TransformResult {
  let out = "";
  let changed = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    if (char === '"' || char === "'") {
      const quoted = copyQuotedString(input, i);
      out += quoted.text;
      i = quoted.end;
      continue;
    }

    if (char === "/" && input[i + 1] === "/") {
      changed = true;
      i += 2;
      while (i < input.length && input[i] !== "\n") i++;
      continue;
    }

    if (char === "/" && input[i + 1] === "*") {
      changed = true;
      i += 2;
      while (i < input.length && !(input[i] === "*" && input[i + 1] === "/")) {
        if (input[i] === "\n") out += "\n";
        i++;
      }
      i += input[i] === "*" && input[i + 1] === "/" ? 2 : 0;
      continue;
    }

    out += char;
    i++;
  }

  return { text: out, changed };
}

function decodeSingleQuotedEscape(input: string, index: number): { value: string; next: number } {
  const char = input[index];
  if (char === "n") return { value: "\n", next: index + 1 };
  if (char === "r") return { value: "\r", next: index + 1 };
  if (char === "t") return { value: "\t", next: index + 1 };
  if (char === "b") return { value: "\b", next: index + 1 };
  if (char === "f") return { value: "\f", next: index + 1 };
  if (char === "v") return { value: "\v", next: index + 1 };
  if (char === "0") return { value: "\0", next: index + 1 };
  if (char === "x" && /^[0-9a-fA-F]{2}$/.test(input.slice(index + 1, index + 3))) {
    return { value: String.fromCharCode(parseInt(input.slice(index + 1, index + 3), 16)), next: index + 3 };
  }
  if (char === "u" && /^[0-9a-fA-F]{4}$/.test(input.slice(index + 1, index + 5))) {
    return { value: String.fromCharCode(parseInt(input.slice(index + 1, index + 5), 16)), next: index + 5 };
  }
  return { value: char, next: index + 1 };
}

function normalizeSingleQuotedStrings(input: string): TransformResult {
  let out = "";
  let changed = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    if (char === '"') {
      const quoted = copyQuotedString(input, i);
      out += quoted.text;
      i = quoted.end;
      continue;
    }

    if (char !== "'") {
      out += char;
      i++;
      continue;
    }

    changed = true;
    i++;
    let value = "";
    let closed = false;
    while (i < input.length) {
      const inner = input[i];
      if (inner === "\\") {
        const decoded = decodeSingleQuotedEscape(input, i + 1);
        value += decoded.value;
        i = decoded.next;
        continue;
      }
      if (inner === "'") {
        closed = true;
        i++;
        break;
      }
      value += inner;
      i++;
    }
    out += closed ? JSON.stringify(value) : `'${value}`;
  }

  return { text: out, changed };
}

function isIdentifierStart(char: string | undefined): boolean {
  return char !== undefined && /[A-Za-z_$]/.test(char);
}

function isIdentifierPart(char: string | undefined): boolean {
  return char !== undefined && /[A-Za-z0-9_$-]/.test(char);
}

function quoteUnquotedKeys(input: string): TransformResult {
  type StackEntry = { type: "object" | "array"; expectingKey: boolean };
  const stack: StackEntry[] = [];
  let out = "";
  let changed = false;
  let i = 0;

  const top = () => stack[stack.length - 1];

  while (i < input.length) {
    const current = top();
    const char = input[i];

    if (char === '"') {
      const quoted = copyQuotedString(input, i);
      out += quoted.text;
      i = quoted.end;
      continue;
    }

    if (current?.type === "object" && current.expectingKey && isIdentifierStart(char)) {
      let end = i + 1;
      while (isIdentifierPart(input[end])) end++;
      let lookahead = end;
      while (/\s/.test(input[lookahead] ?? "")) lookahead++;
      if (input[lookahead] === ":") {
        out += JSON.stringify(input.slice(i, end));
        changed = true;
        i = end;
        continue;
      }
    }

    out += char;
    if (char === "{") stack.push({ type: "object", expectingKey: true });
    else if (char === "[") stack.push({ type: "array", expectingKey: false });
    else if (char === "}" || char === "]") stack.pop();
    else if (char === ":" && current?.type === "object") current.expectingKey = false;
    else if (char === "," && current?.type === "object") current.expectingKey = true;
    i++;
  }

  return { text: out, changed };
}

function removeTrailingCommas(input: string): TransformResult {
  let out = "";
  let changed = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    if (char === '"') {
      const quoted = copyQuotedString(input, i);
      out += quoted.text;
      i = quoted.end;
      continue;
    }

    if (char === ",") {
      let next = i + 1;
      while (/\s/.test(input[next] ?? "")) next++;
      if (input[next] === "}" || input[next] === "]") {
        changed = true;
        i++;
        continue;
      }
    }

    out += char;
    i++;
  }

  return { text: out, changed };
}

function normalizeRelaxedLiterals(input: string): TransformResult {
  const replacements: Record<string, string> = {
    undefined: "null",
    NaN: "null",
    Infinity: "null",
    True: "true",
    False: "false",
    None: "null",
  };
  let out = "";
  let changed = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    if (char === '"') {
      const quoted = copyQuotedString(input, i);
      out += quoted.text;
      i = quoted.end;
      continue;
    }

    if (input.startsWith("-Infinity", i) && !isIdentifierPart(input[i + 9])) {
      out += "null";
      changed = true;
      i += 9;
      continue;
    }

    if (isIdentifierStart(char)) {
      let end = i + 1;
      while (isIdentifierPart(input[end])) end++;
      const word = input.slice(i, end);
      const replacement = replacements[word];
      if (replacement !== undefined) {
        out += replacement;
        changed = true;
      } else {
        out += word;
      }
      i = end;
      continue;
    }

    out += char;
    i++;
  }

  return { text: out, changed };
}

function parseYamlFallback(input: string): { ok: true; value: unknown } | { ok: false; error: ParseError } {
  try {
    return { ok: true, value: parseYaml(input) };
  } catch (error) {
    return { ok: false, error: toParseError(input, error) };
  }
}

export function processJsonRepairInput(input: string, indent: JsonRepairIndent): JsonRepairResult {
  if (!input.trim()) {
    return { output: "", errors: [], operations: [], repaired: false };
  }

  const bom = stripBom(input);
  const initial = tryParseJson(bom.text);
  if (initial.ok === true) {
    return {
      output: formatJson(initial.value, indent),
      errors: [],
      operations: bom.changed ? ["Removed byte-order mark", "Input was already valid JSON"] : ["Input was already valid JSON"],
      repaired: bom.changed,
    };
  }

  let current = bom.text;
  const operations: string[] = [];
  if (bom.changed) operations.push("Removed byte-order mark");

  const transforms: { label: string; run: (value: string) => TransformResult }[] = [
    { label: "Removed comments", run: stripComments },
    { label: "Converted single-quoted strings", run: normalizeSingleQuotedStrings },
    { label: "Quoted unquoted object keys", run: quoteUnquotedKeys },
    { label: "Normalized relaxed literals", run: normalizeRelaxedLiterals },
    { label: "Removed trailing commas", run: removeTrailingCommas },
  ];

  for (const transform of transforms) {
    const next = transform.run(current);
    if (next.changed) operations.push(transform.label);
    current = next.text;
  }

  const repairedJson = tryParseJson(current);
  if (repairedJson.ok === true) {
    return {
      output: formatJson(repairedJson.value, indent),
      errors: [],
      operations: operations.length ? operations : ["Normalized input"],
      repaired: true,
    };
  }

  const yamlResult = parseYamlFallback(current);
  if (yamlResult.ok === true) {
    return {
      output: formatJson(yamlResult.value, indent),
      errors: [],
      operations: [...operations, "Parsed as YAML-compatible relaxed JSON"],
      repaired: true,
    };
  }

  return {
    output: "",
    errors: [repairedJson.error],
    operations,
    repaired: false,
  };
}
