/**
 * Core JSON utilities — pure functions, no React, no side effects.
 */

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  snippet: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  parsed?: unknown;
}

export interface JsonStats {
  keys: number;
  depth: number;
  arrays: number;
  objects: number;
  size: string;
}

/**
 * Strict JSON validator (RFC 8259 / ECMA-404 compliant)
 */
export const strictValidateJson = (input: string): ValidationResult => {
  const errors: ValidationError[] = [];
  const lines = input.split("\n");

  const getPosition = (pos: number) => {
    let line = 1, col = 1;
    for (let i = 0; i < pos && i < input.length; i++) {
      if (input[i] === "\n") { line++; col = 1; } else { col++; }
    }
    return { line, col };
  };

  const getSnippet = (lineNum: number) => {
    const l = lines[lineNum - 1] || "";
    return l.length > 80 ? l.slice(0, 80) + "…" : l;
  };

  // Trailing comma detection
  const trailingCommaRegex = /,\s*([}\]])/g;
  let match;
  while ((match = trailingCommaRegex.exec(input)) !== null) {
    const pos = getPosition(match.index);
    errors.push({ line: pos.line, column: pos.col, message: "Trailing comma before closing bracket/brace", snippet: getSnippet(pos.line) });
  }

  // Single quote detection
  const singleQuoteRegex = /(?<!")'\s*[^']*'\s*(?!["\\])/g;
  const stripped = input.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  let sqMatch;
  while ((sqMatch = singleQuoteRegex.exec(stripped)) !== null) {
    const pos = getPosition(sqMatch.index);
    errors.push({ line: pos.line, column: pos.col, message: 'Single quotes are not valid in JSON. Use double quotes (")', snippet: getSnippet(pos.line) });
  }

  // Unquoted key detection
  const unquotedKeyRegex = /(?:^|[{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/gm;
  let ukMatch;
  while ((ukMatch = unquotedKeyRegex.exec(stripped)) !== null) {
    if (!["true", "false", "null"].includes(ukMatch[1])) {
      const pos = getPosition(ukMatch.index + ukMatch[0].indexOf(ukMatch[1]));
      errors.push({ line: pos.line, column: pos.col, message: `Unquoted key "${ukMatch[1]}". Keys must be wrapped in double quotes`, snippet: getSnippet(pos.line) });
    }
  }

  // Comment detection
  const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
  let cmMatch;
  while ((cmMatch = commentRegex.exec(stripped)) !== null) {
    const pos = getPosition(cmMatch.index);
    errors.push({ line: pos.line, column: pos.col, message: "Comments are not allowed in JSON", snippet: getSnippet(pos.line) });
  }

  try {
    const parsed = JSON.parse(input);
    return { valid: errors.length === 0, errors, parsed };
  } catch (e) {
    const msg = (e as Error).message;
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = getPosition(Number(posMatch[1]));
      errors.push({ line: pos.line, column: pos.col, message: msg.replace(/^JSON\.parse:\s*/i, "").replace(/^Unexpected/i, "Unexpected"), snippet: getSnippet(pos.line) });
    } else {
      const lineMatch = msg.match(/line\s+(\d+)/i);
      const colMatch = msg.match(/column\s+(\d+)/i);
      errors.push({ line: lineMatch ? Number(lineMatch[1]) : 1, column: colMatch ? Number(colMatch[1]) : 1, message: msg, snippet: getSnippet(lineMatch ? Number(lineMatch[1]) : 1) });
    }
    return { valid: false, errors };
  }
};

/**
 * Recursively sort object keys alphabetically
 */
export const sortKeysDeep = (obj: unknown): unknown => {
  if (Array.isArray(obj)) return obj.map(sortKeysDeep);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => { acc[key] = sortKeysDeep((obj as Record<string, unknown>)[key]); return acc; }, {} as Record<string, unknown>);
  }
  return obj;
};

/**
 * Compute statistics about a parsed JSON value
 */
export const computeJsonStats = (parsed: unknown): JsonStats => {
  let keys = 0, depth = 0, arrays = 0, objects = 0;
  const walk = (v: unknown, d: number) => {
    if (d > depth) depth = d;
    if (Array.isArray(v)) { arrays++; v.forEach((item) => walk(item, d + 1)); }
    else if (v !== null && typeof v === "object") {
      objects++;
      const entries = Object.entries(v as Record<string, unknown>);
      keys += entries.length;
      entries.forEach(([, val]) => walk(val, d + 1));
    }
  };
  walk(parsed, 0);
  const bytes = new TextEncoder().encode(JSON.stringify(parsed)).length;
  const size = bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
  return { keys, depth, arrays, objects, size };
};

/**
 * Format JSON with indentation
 */
export const formatJson = (input: string, indent: number = 2, sortKeys: boolean = false): string => {
  const parsed = JSON.parse(input);
  const data = sortKeys ? sortKeysDeep(parsed) : parsed;
  return JSON.stringify(data, null, indent);
};

/**
 * Minify JSON
 */
export const minifyJson = (input: string): string => {
  return JSON.stringify(JSON.parse(input));
};
