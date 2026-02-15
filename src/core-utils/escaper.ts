/**
 * Text escape/unescape for XML, Java/.NET, JavaScript, JSON, CSV, SQL.
 */

// ── XML ──────────────────────────────────────────────────────────────
const xmlMap: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
};

function escapeXml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => xmlMap[c] ?? c);
}

function unescapeXml(s: string): string {
  const doc = new DOMParser().parseFromString(s, "text/html");
  return doc.documentElement.textContent ?? s;
}

// ── Java / .NET (string literal) ─────────────────────────────────────
function escapeJavaDotNet(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

function unescapeJavaDotNet(s: string): string {
  return s.replace(/\\(["\\nrt])/g, (_, c) => ({ '"': '"', "\\": "\\", n: "\n", r: "\r", t: "\t" }[c] ?? c));
}

// ── JavaScript (string literal) ────────────────────────────────────────
function escapeJavaScript(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\f/g, "\\f")
    .replace(/\v/g, "\\v")
    .replace(/\b/g, "\\b")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

function unescapeJavaScript(s: string): string {
  const map: Record<string, string> = { n: "\n", r: "\r", t: "\t", "\\": "\\", "'": "'", '"': '"', b: "\b", f: "\f", v: "\v" };
  return s.replace(/\\(.)/gs, (_, c) => map[c] ?? c);
}

// ── JSON (same as JS for string content) ───────────────────────────────
const escapeJson = escapeJavaScript;
const unescapeJson = unescapeJavaScript;

// ── CSV (RFC 4180: double quote and wrap if needed) ─────────────────────
function escapeCsv(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function unescapeCsv(s: string): string {
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1).replace(/""/g, '"');
  return s;
}

// ── SQL (single quote double for literal) ──────────────────────────────
function escapeSql(s: string): string {
  return s.replace(/'/g, "''");
}

function unescapeSql(s: string): string {
  return s.replace(/''/g, "'");
}

export type EscaperType = "xml" | "java" | "javascript" | "json" | "csv" | "sql";

const encoders: Record<EscaperType, (s: string) => string> = {
  xml: escapeXml,
  java: escapeJavaDotNet,
  javascript: escapeJavaScript,
  json: escapeJson,
  csv: escapeCsv,
  sql: escapeSql,
};

const decoders: Record<EscaperType, (s: string) => string> = {
  xml: unescapeXml,
  java: unescapeJavaDotNet,
  javascript: unescapeJavaScript,
  json: unescapeJson,
  csv: unescapeCsv,
  sql: unescapeSql,
};

export function escapeText(type: EscaperType, s: string): string {
  return encoders[type](s);
}

export function unescapeText(type: EscaperType, s: string): string {
  return decoders[type](s);
}
