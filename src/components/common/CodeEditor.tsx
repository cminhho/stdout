/** Code editor – textarea with optional line numbers, syntax highlighting, error markers, and find (⌘F). */
import { memo, useRef, useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/utils/cn";

export type Language =
  | "json"
  | "xml"
  | "html"
  | "svg"
  | "css"
  | "sql"
  | "yaml"
  | "markdown"
  | "text"
  | "env"
  | "toml"
  | "dockerfile"
  | "pem"
  | "csv"
  | "curl"
  | "javascript"
  | "typescript"
  | "go"
  | "java"
  | "kotlin"
  | "plaintext"
  | "randomstring"
  | "log";

/** Metadata passed when content changes; useful for line-by-line handling without re-splitting. */
export interface CodeEditorChangeMeta {
  /** Current lines (value split by "\n"). Same reference until value changes. */
  lines: string[];
  /** Number of lines. */
  lineCount: number;
}

export interface CodeEditorProps {
  /** Current editor content (controlled). */
  value: string;
  /** Called on content change. Second arg provides lines array for line-by-line consumers. */
  onChange?: (value: string, meta?: CodeEditorChangeMeta) => void;
  /**
   * Syntax highlighting language. Drives tokenization and is exposed as data-language on the root
   * for styling, testing, and accessibility. Default "json"; set explicitly for correct highlighting.
   */
  language?: Language;
  readOnly?: boolean;
  placeholder?: string;
  /** 1-based line numbers to highlight as errors. */
  errorLines?: Set<number>;
  className?: string;
  /** When true, editor fills container height (no fixed min/max height). */
  fillHeight?: boolean;
  /** Optional key down handler (e.g. for Enter to submit). */
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  /** When false, hides the line number gutter (default true). */
  showLineNumbers?: boolean;
  /** When set, renders this content instead of the code textarea (e.g. JSON tree view). Same wrapper/border/scroll. */
  customContent?: React.ReactNode;
  /** When true with customContent, drops the inner padding so the content can manage its own layout (e.g. a flush gutter). */
  customContentNoPad?: boolean;
  /** Optional aria-label for the code textarea (defaults to code view + language when readOnly). */
  ariaLabel?: string;
}

// ── Syntax tokenizers ────────────────────────────────────────────────

interface Token {
  type: "key" | "string" | "number" | "boolean" | "null" | "bracket" | "punctuation" | "tag" | "attr" | "keyword" | "comment" | "text";
  value: string;
}

const REGEX_JSON =
  /("(?:\\.|[^"\\])*")\s*(?=:)|("(?:\\.|[^"\\])*")|([-+]?\d+\.?\d*(?:[eE][+-]?\d+)?)\b|(true|false)\b|(null)\b|([{}[\]])|([,:])|(\/\/.*$)|(\S+)/g;

const tokenizeJson = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_JSON.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = REGEX_JSON.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }
    if (match[1]) tokens.push({ type: "key", value: match[1] });
    else if (match[2]) tokens.push({ type: "string", value: match[2] });
    else if (match[3]) tokens.push({ type: "number", value: match[3] });
    else if (match[4]) tokens.push({ type: "boolean", value: match[4] });
    else if (match[5]) tokens.push({ type: "null", value: match[5] });
    else if (match[6]) tokens.push({ type: "bracket", value: match[6] });
    else if (match[7]) tokens.push({ type: "punctuation", value: match[7] });
    else if (match[8]) tokens.push({ type: "comment", value: match[8] });
    else if (match[9]) tokens.push({ type: "text", value: match[9] });
    lastIndex = REGEX_JSON.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }
  return tokens;
};

const REGEX_HTML =
  /(<!--[\s\S]*?-->)|(<\/?[a-zA-Z][a-zA-Z0-9-]*)|(\s[a-zA-Z-]+)(?==)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(>|\/>)|([^<>"']+)/g;

const tokenizeHtml = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_HTML.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_HTML.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) tokens.push({ type: "tag", value: match[2] });
    else if (match[3]) tokens.push({ type: "attr", value: match[3] });
    else if (match[4]) tokens.push({ type: "string", value: match[4] });
    else if (match[5]) tokens.push({ type: "tag", value: match[5] });
    else if (match[6]) tokens.push({ type: "text", value: match[6] });
    lastIndex = REGEX_HTML.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const REGEX_CSS =
  /(\/\*[\s\S]*?\*\/|\/\/.*$)|([.#@][a-zA-Z_-][\w-]*)|([a-zA-Z-]+)(?=\s*:)|(:\s*)|(["'](?:[^"'\\]|\\.)*["'])|([-+]?\d+\.?\d*(?:px|em|rem|%|vh|vw|s|ms|deg|fr)?)\b|([{}();,])|([^{}"';,:\s]+)/g;

const tokenizeCss = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_CSS.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_CSS.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) tokens.push({ type: "keyword", value: match[2] });
    else if (match[3]) tokens.push({ type: "attr", value: match[3] });
    else if (match[4]) tokens.push({ type: "punctuation", value: match[4] });
    else if (match[5]) tokens.push({ type: "string", value: match[5] });
    else if (match[6]) tokens.push({ type: "number", value: match[6] });
    else if (match[7]) tokens.push({ type: "bracket", value: match[7] });
    else if (match[8]) tokens.push({ type: "text", value: match[8] });
    lastIndex = REGEX_CSS.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

/** SQL keywords (uppercase) for O(1) per-word lookup; matched case-insensitively. */
const SQL_KEYWORDS = new Set(
  "SELECT FROM WHERE INSERT INTO UPDATE DELETE SET CREATE ALTER DROP TABLE INDEX JOIN LEFT RIGHT INNER OUTER ON AND OR NOT IN IS NULL AS ORDER BY GROUP HAVING LIMIT OFFSET UNION ALL DISTINCT EXISTS BETWEEN LIKE CASE WHEN THEN ELSE END BEGIN COMMIT ROLLBACK VALUES PRIMARY KEY FOREIGN REFERENCES DEFAULT CONSTRAINT CHECK UNIQUE INT VARCHAR TEXT BOOLEAN DATE TIMESTAMP FLOAT DOUBLE DECIMAL IF GRANT REVOKE WITH RECURSIVE FETCH CURSOR DECLARE".split(
    " "
  )
);
const REGEX_SQL = /(--.*$)|(')([^']*)(')|(")([^"]*)(")|\b(\d+\.?\d*)\b|([(),;*=<>!+\-/.])|(\w+)|(\s+)/g;

const tokenizeSql = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_SQL.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_SQL.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) {
      tokens.push({ type: "string", value: match[2] + match[3] + match[4] });
    } else if (match[5]) {
      tokens.push({ type: "string", value: match[5] + match[6] + match[7] });
    } else if (match[8]) tokens.push({ type: "number", value: match[8] });
    else if (match[9]) tokens.push({ type: "punctuation", value: match[9] });
    else if (match[10]) {
      tokens.push({ type: SQL_KEYWORDS.has(match[10].toUpperCase()) ? "keyword" : "text", value: match[10] });
    } else if (match[11]) tokens.push({ type: "text", value: match[11] });
    lastIndex = REGEX_SQL.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const REGEX_YAML_KEY = /^(\s*(?:-\s*)?)((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s:[\]#][^:[\]#]*?))(\s*:)(.*)$/;
const REGEX_YAML_SCALAR = /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(true|false|yes|no|on|off)\b|(null|~)\b|([-+]?\d+\.?\d*(?:[eE][+-]?\d+)?)\b|(-\s)|([|>][-+]?)|([[\]{},])|(\S+)/g;

function appendYamlPrefix(tokens: Token[], prefix: string) {
  if (!prefix) return;
  const marker = prefix.match(/^(\s*)(-\s*)$/);
  if (!marker) {
    tokens.push({ type: "text", value: prefix });
    return;
  }
  if (marker[1]) tokens.push({ type: "text", value: marker[1] });
  tokens.push({ type: "punctuation", value: marker[2] });
}

const tokenizeYamlScalars = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_YAML_SCALAR.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_YAML_SCALAR.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) tokens.push({ type: "string", value: match[2] });
    else if (match[3]) tokens.push({ type: "boolean", value: match[3] });
    else if (match[4]) tokens.push({ type: "null", value: match[4] });
    else if (match[5]) tokens.push({ type: "number", value: match[5] });
    else if (match[6]) tokens.push({ type: "punctuation", value: match[6] });
    else if (match[7]) tokens.push({ type: "keyword", value: match[7] });
    else if (match[8]) tokens.push({ type: "bracket", value: match[8] });
    else if (match[9]) tokens.push({ type: "text", value: match[9] });
    lastIndex = REGEX_YAML_SCALAR.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizeYaml = (line: string): Token[] => {
  const keyMatch = line.match(REGEX_YAML_KEY);
  if (!keyMatch) return tokenizeYamlScalars(line);

  const tokens: Token[] = [];
  appendYamlPrefix(tokens, keyMatch[1]);
  tokens.push({ type: "key", value: keyMatch[2] });
  tokens.push({ type: "punctuation", value: keyMatch[3] });
  tokens.push(...tokenizeYamlScalars(keyMatch[4]));
  return tokens;
};

const REGEX_XML =
  /(<!--[\s\S]*?-->)|(<!\[CDATA\[[\s\S]*?\]\]>)|(<\?[\s\S]*?\?>)|(<!DOCTYPE[\s\S]*?>)|(<\/?[A-Za-z_][\w:.-]*)|(\s[A-Za-z_:][\w:.-]*)(?==)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(>|\/>)|([^<>"']+)/g;

const tokenizeXml = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_XML.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_XML.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1] || match[2]) tokens.push({ type: "comment", value: match[1] ?? match[2]! });
    else if (match[3] || match[4]) tokens.push({ type: "keyword", value: match[3] ?? match[4]! });
    else if (match[5]) tokens.push({ type: "tag", value: match[5] });
    else if (match[6]) tokens.push({ type: "attr", value: match[6] });
    else if (match[7]) tokens.push({ type: "string", value: match[7] });
    else if (match[8]) tokens.push({ type: "tag", value: match[8] });
    else if (match[9]) tokens.push({ type: "text", value: match[9] });
    lastIndex = REGEX_XML.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizeSvg = tokenizeXml;

const tokenizeMarkdown = (line: string): Token[] => {
  const tokens: Token[] = [];
  if (/^#{1,6}\s/.test(line)) { tokens.push({ type: "keyword", value: line }); return tokens; }
  if (/^(\*{3}|-{3}|_{3})/.test(line)) { tokens.push({ type: "comment", value: line }); return tokens; }
  if (/^>\s/.test(line)) { tokens.push({ type: "string", value: line }); return tokens; }
  if (/^[-*+]\s|^\d+\.\s/.test(line)) {
    const m = line.match(/^([-*+]\s|\d+\.\s)/);
    if (m) { tokens.push({ type: "keyword", value: m[0] }); tokens.push({ type: "text", value: line.slice(m[0].length) }); return tokens; }
  }
  tokens.push({ type: "text", value: line });
  return tokens;
};

const tokenizeEnv = (line: string): Token[] => {
  if (/^\s*#/.test(line)) return [{ type: "comment", value: line }];
  const eqIdx = line.indexOf("=");
  if (eqIdx === -1) return [{ type: "text", value: line }];
  return [
    { type: "key", value: line.slice(0, eqIdx) },
    { type: "punctuation", value: "=" },
    { type: "string", value: line.slice(eqIdx + 1) },
  ];
};

const REGEX_TOML =
  /(#.*$)|(\[[^\]]+\])|([A-Za-z0-9_.-]+)(\s*=)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(true|false)\b|([-+]?\d+\.?\d*(?:[eE][+-]?\d+)?)\b|([[\]{},=])|(\S+)/g;

const tokenizeToml = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_TOML.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_TOML.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) tokens.push({ type: "tag", value: match[2] });
    else if (match[3]) {
      tokens.push({ type: "key", value: match[3] });
      tokens.push({ type: "punctuation", value: match[4] });
    } else if (match[5]) tokens.push({ type: "string", value: match[5] });
    else if (match[6]) tokens.push({ type: "boolean", value: match[6] });
    else if (match[7]) tokens.push({ type: "number", value: match[7] });
    else if (match[8]) tokens.push({ type: "bracket", value: match[8] });
    else if (match[9]) tokens.push({ type: "text", value: match[9] });
    lastIndex = REGEX_TOML.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizeCsv = (line: string): Token[] => {
  const tokens: Token[] = [];
  const parts = line.split(",");
  parts.forEach((part, i) => {
    if (i > 0) tokens.push({ type: "punctuation", value: "," });
    if (/^".*"$/.test(part.trim())) tokens.push({ type: "string", value: part });
    else if (/^[-+]?\d+\.?\d*$/.test(part.trim())) tokens.push({ type: "number", value: part });
    else tokens.push({ type: "text", value: part });
  });
  return tokens;
};

const DOCKERFILE_INSTRUCTIONS = new Set(
  "FROM RUN CMD LABEL MAINTAINER EXPOSE ENV ADD COPY ENTRYPOINT VOLUME USER WORKDIR ARG ONBUILD STOPSIGNAL HEALTHCHECK SHELL".split(
    " "
  )
);
const REGEX_DOCKERFILE =
  /(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(--[A-Za-z][\w-]*)(?=\s|=)|(\b\d+\b)|([[\]{}(),=])|([A-Za-z_][A-Za-z0-9_-]*)(?=\s|$)|(\S+)/g;

const tokenizeDockerfile = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_DOCKERFILE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_DOCKERFILE.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) tokens.push({ type: "string", value: match[2] });
    else if (match[3]) tokens.push({ type: "keyword", value: match[3] });
    else if (match[4]) tokens.push({ type: "number", value: match[4] });
    else if (match[5]) tokens.push({ type: "bracket", value: match[5] });
    else if (match[6]) {
      tokens.push({ type: DOCKERFILE_INSTRUCTIONS.has(match[6].toUpperCase()) ? "keyword" : "text", value: match[6] });
    } else if (match[7]) tokens.push({ type: "text", value: match[7] });
    lastIndex = REGEX_DOCKERFILE.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizePem = (line: string): Token[] => {
  if (/^-----BEGIN [A-Z0-9 ]+-----$|^-----END [A-Z0-9 ]+-----$/.test(line)) return [{ type: "keyword", value: line }];
  if (/^[A-Za-z0-9+/=]+$/.test(line)) return [{ type: "string", value: line }];
  return [{ type: "text", value: line }];
};

/** Code keywords (case-sensitive) for O(1) per-word lookup. */
const CODE_KEYWORDS = new Set(
  "interface type class function const let var import export from return if else for while switch case break continue new this extends implements public private protected static readonly abstract async await try catch throw finally void null undefined true false struct func package data val fun override companion object sealed enum int string boolean number float double long byte char short".split(
    " "
  )
);
const REGEX_CODE = /(\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+\.?\d*\b)|([{}[\]().,;:=<>!+\-*/&|?@])|(\w+)|(\s+)/g;

const tokenizeCode = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_CODE.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_CODE.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) tokens.push({ type: "string", value: match[2] });
    else if (match[3]) tokens.push({ type: "number", value: match[3] });
    else if (match[4]) tokens.push({ type: "bracket", value: match[4] });
    else if (match[5]) {
      tokens.push({ type: CODE_KEYWORDS.has(match[5]) ? "keyword" : "text", value: match[5] });
    } else if (match[6]) tokens.push({ type: "text", value: match[6] });
    lastIndex = REGEX_CODE.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizePlain = (line: string): Token[] => [{ type: "text", value: line }];

/** Random string / password: tokenize digits, uppercase, lowercase, symbols (industry practice for scannability). */
const REGEX_RANDOMSTRING = /(\d+)|([A-Z]+)|([a-z]+)|([^0-9A-Za-z]+)/g;

const tokenizeRandomString = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_RANDOMSTRING.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_RANDOMSTRING.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }
    if (match[1]) tokens.push({ type: "number", value: match[1] });
    else if (match[2]) tokens.push({ type: "keyword", value: match[2] });
    else if (match[3]) tokens.push({ type: "string", value: match[3] });
    else if (match[4]) tokens.push({ type: "punctuation", value: match[4] });
    lastIndex = REGEX_RANDOMSTRING.lastIndex;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }
  return tokens;
};

/** Log lines: timestamps, IPs, log levels, HTTP methods, status codes, quoted strings, app names (Apache, Nginx, Syslog, JSON, Docker). */
const REGEX_LOG =
  /("(?:[^"\\]|\\.)*")|(\d{4}-\d{2}-\d{2}T[\d.:Z+-]+)|(\[\d{2}\/\w+\/\d{4}:\d{2}:\d{2}:\d{2}[^\]]*\]|\d{2}:\d{2}:\d{2})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})|(\b(?:INFO|WARN|WARNING|ERROR|DEBUG|emerg|alert|crit|err|notice|info|debug)\b)|(\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b)|(\b\d{3}\b)|(\b\d+\b)|([[\]<>])|([|:,-])|([a-zA-Z][a-zA-Z0-9_.-]*(?:\.[a-zA-Z0-9_.-]+)*)|(\S+)/g;

const tokenizeLog = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_LOG.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_LOG.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }
    if (match[1]) tokens.push({ type: "string", value: match[1] });
    else if (match[2] || match[3]) tokens.push({ type: "key", value: match[2] ?? match[3]! });
    else if (match[4]) tokens.push({ type: "keyword", value: match[4] });
    else if (match[5] || match[6]) tokens.push({ type: "keyword", value: match[5] ?? match[6]! });
    else if (match[7]) tokens.push({ type: "keyword", value: match[7] });
    else if (match[8] || match[9]) tokens.push({ type: "number", value: match[8] ?? match[9]! });
    else if (match[10]) tokens.push({ type: "bracket", value: match[10] });
    else if (match[11]) tokens.push({ type: "punctuation", value: match[11] });
    else if (match[12]) tokens.push({ type: "tag", value: match[12] });
    else if (match[13]) tokens.push({ type: "text", value: match[13] });
    lastIndex = REGEX_LOG.lastIndex;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }
  return tokens;
};

/** cURL / terminal command: curl, options (-X, -H, -d, -v, -L, -k, --*), quoted strings, HTTP methods, URLs */
const tokenizeCurl = (line: string): Token[] => {
  const tokens: Token[] = [];
  const regex = /(\bcurl\b)|(-[a-zA-Z]|--[a-zA-Z][a-zA-Z0-9-]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\\\s*$)|(https?:\/\/[^\s'"]+)|(\b(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b)|(\S+)/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }
    if (match[1]) tokens.push({ type: "keyword", value: match[1] });
    else if (match[2]) tokens.push({ type: "keyword", value: match[2] });
    else if (match[3]) tokens.push({ type: "string", value: match[3] });
    else if (match[4]) tokens.push({ type: "punctuation", value: match[4] });
    else if (match[5]) tokens.push({ type: "string", value: match[5] });
    else if (match[6]) tokens.push({ type: "keyword", value: match[6] });
    else if (match[7]) tokens.push({ type: "text", value: match[7] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: "text", value: line.slice(lastIndex) });
  }
  return tokens;
};

const getTokenizer = (lang: Language) => {
  switch (lang) {
    case "json": return tokenizeJson;
    case "html": return tokenizeHtml;
    case "xml": return tokenizeXml;
    case "svg": return tokenizeSvg;
    case "css": return tokenizeCss;
    case "sql": return tokenizeSql;
    case "yaml": return tokenizeYaml;
    case "markdown": return tokenizeMarkdown;
    case "env": return tokenizeEnv;
    case "toml": return tokenizeToml;
    case "dockerfile": return tokenizeDockerfile;
    case "pem": return tokenizePem;
    case "csv": return tokenizeCsv;
    case "curl": return tokenizeCurl;
    case "javascript": case "typescript": case "go": case "java": case "kotlin": return tokenizeCode;
    case "randomstring": return tokenizeRandomString;
    case "log": return tokenizeLog;
    case "text": case "plaintext": return tokenizePlain;
    default: return tokenizePlain;
  }
};

const LANGUAGE_LABELS: Partial<Record<Language, string>> = {
  dockerfile: "Dockerfile",
  pem: "PEM",
};

const getLanguageLabel = (language: Language): string => LANGUAGE_LABELS[language] ?? language;

/* Token colors from CSS variables (key, string green, number orange, boolean/keyword purple, comment gray) */
const tokenColors: Record<Token["type"], string> = {
  key: "hsl(var(--code-key))",
  string: "hsl(var(--code-string))",
  number: "hsl(var(--code-number))",
  boolean: "hsl(var(--code-boolean))",
  null: "hsl(var(--code-null))",
  bracket: "hsl(var(--code-bracket))",
  punctuation: "hsl(var(--code-punctuation))",
  tag: "hsl(var(--code-tag))",
  attr: "hsl(var(--code-number))",
  keyword: "hsl(var(--code-boolean))",
  comment: "hsl(var(--code-comment))",
  text: "hsl(var(--foreground))",
};

/* Random string: distinct colors per character type (digit / upper / lower / symbol). Uses --code-rs-* (macOS + Liquid Glass–friendly, WCAG AA). */
const randomStringTokenColors: Record<Token["type"], string> = {
  ...tokenColors,
  number: "hsl(var(--code-rs-digit))",
  keyword: "hsl(var(--code-rs-upper))",
  string: "hsl(var(--code-rs-lower))",
  punctuation: "hsl(var(--code-rs-symbol))",
  text: "hsl(var(--foreground))",
};

/* Log view: timestamp, level/method, number, string, tag (app name). Uses --code-log-* (macOS + Liquid Glass–friendly). */
const logTokenColors: Record<Token["type"], string> = {
  ...tokenColors,
  key: "hsl(var(--code-log-timestamp))",
  keyword: "hsl(var(--code-log-level))",
  tag: "hsl(var(--code-log-app))",
};

/**
 * One highlighted line in the overlay. Memoized so that, on a keystroke, only the line whose tokens
 * actually changed re-renders — unchanged lines keep the same (cached) token array reference and skip.
 */
const HighlightLine = memo(function HighlightLine({
  tokens,
  isError,
  isFindMatch,
  colors,
}: {
  tokens: Token[];
  isError: boolean;
  isFindMatch: boolean;
  colors: Record<Token["type"], string>;
}) {
  return (
    <div
      className="whitespace-pre"
      style={{
        height: "calc(var(--code-line-height) * 1em)",
        lineHeight: "var(--code-line-height)",
        background: isFindMatch
          ? "hsl(var(--primary) / 0.18)"
          : isError
            ? "hsl(var(--destructive) / 0.08)"
            : "transparent",
      }}
    >
      {tokens.length === 0
        ? "\n"
        : tokens.map((token, j) => (
            <span key={j} style={{ color: colors[token.type] }}>
              {token.value}
            </span>
          ))}
    </div>
  );
});

// ── Hooks ───────────────────────────────────────────────────────────

/** Syncs textarea scroll to highlight overlay and line gutter for aligned scrolling. */
function useCodeEditorScrollSync(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  highlightRef: React.RefObject<HTMLDivElement | null>,
  gutterRef: React.RefObject<HTMLDivElement | null>
) {
  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const hl = highlightRef.current;
    const gt = gutterRef.current;
    if (ta && hl) {
      hl.scrollTop = ta.scrollTop;
      hl.scrollLeft = ta.scrollLeft;
    }
    if (ta && gt) {
      gt.scrollTop = ta.scrollTop;
    }
  }, [textareaRef, highlightRef, gutterRef]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.addEventListener("scroll", syncScroll);
    return () => ta.removeEventListener("scroll", syncScroll);
  }, [syncScroll, textareaRef]);
}

// ── Component ────────────────────────────────────────────────────────

const CodeEditor = memo(function CodeEditor({
  value,
  onChange,
  language = "json",
  readOnly = false,
  placeholder = "",
  errorLines,
  className = "",
  fillHeight = false,
  onKeyDown: onKeyDownProp,
  showLineNumbers = true,
  customContent,
  customContentNoPad = false,
  ariaLabel,
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => (value ? value.split("\n") : [""]), [value]);
  const tokenizer = useMemo(() => getTokenizer(language), [language]);
  const colors = useMemo(
    () =>
      language === "randomstring"
        ? randomStringTokenColors
        : language === "log"
          ? logTokenColors
          : tokenColors,
    [language]
  );

  // Per-line tokenization cache keyed by line text: a keystroke only re-tokenizes the changed
  // line(s); unchanged lines reuse their cached token array (also keeps the row memo from re-rendering).
  // The cache is rebuilt to hold only currently-present lines, so memory stays bounded by the document.
  const cacheRef = useRef<Map<string, Token[]>>(new Map());
  const lastTokenizerRef = useRef(tokenizer);
  const tokenizedLines = useMemo(() => {
    // Drop the cache when the language (tokenizer) changes so stale token types don't persist.
    const prev = lastTokenizerRef.current === tokenizer ? cacheRef.current : new Map<string, Token[]>();
    lastTokenizerRef.current = tokenizer;
    const next = new Map<string, Token[]>();
    const result = lines.map((line) => {
      let toks = next.get(line) ?? prev.get(line);
      if (!toks) toks = tokenizer(line);
      next.set(line, toks);
      return toks;
    });
    cacheRef.current = next;
    return result;
  }, [lines, tokenizer]);

  const textareaAriaLabel = ariaLabel ?? (readOnly ? `Code view, ${getLanguageLabel(language)}` : undefined);

  useCodeEditorScrollSync(textareaRef, highlightRef, gutterRef);

  // ── Find (⌘F / Ctrl+F) ──
  const [findOpen, setFindOpen] = useState(false);
  const [findQuery, setFindQuery] = useState("");
  const [activeMatch, setActiveMatch] = useState(0);
  const findInputRef = useRef<HTMLInputElement>(null);

  // Start offsets of every (case-insensitive) match in the document; capped to stay responsive.
  const matches = useMemo(() => {
    if (!findOpen || !findQuery) return [];
    const out: number[] = [];
    const hay = value.toLowerCase();
    const needle = findQuery.toLowerCase();
    let i = hay.indexOf(needle);
    while (i !== -1 && out.length < 5000) {
      out.push(i);
      i = hay.indexOf(needle, i + needle.length);
    }
    return out;
  }, [findOpen, findQuery, value]);
  const activeIdx = matches.length ? Math.min(activeMatch, matches.length - 1) : 0;
  const activeMatchLine = matches.length ? value.slice(0, matches[activeIdx]).split("\n").length : 0;

  const openFind = useCallback(() => {
    setFindOpen(true);
    requestAnimationFrame(() => findInputRef.current?.select());
  }, []);
  const closeFind = useCallback(() => {
    setFindOpen(false);
    textareaRef.current?.focus();
  }, []);
  const gotoMatch = useCallback(
    (dir: 1 | -1) => setActiveMatch((cur) => (matches.length ? (cur + dir + matches.length) % matches.length : 0)),
    [matches.length]
  );

  // Reveal the active match: select it in the textarea and scroll its line into view.
  useEffect(() => {
    if (!findOpen || !matches.length) return;
    const ta = textareaRef.current;
    if (!ta) return;
    const start = matches[activeIdx];
    ta.setSelectionRange(start, start + findQuery.length);
    const lh = parseFloat(getComputedStyle(ta).lineHeight) || 18;
    ta.scrollTop = Math.max(0, (activeMatchLine - 4) * lh);
  }, [findOpen, matches, activeIdx, activeMatchLine, findQuery.length]);

  const handleChange = useCallback(
    (newValue: string) => {
      const newLines = newValue ? newValue.split("\n") : [""];
      onChange?.(newValue, { lines: newLines, lineCount: newLines.length });
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        openFind();
        return;
      }
      if (!readOnly && e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newVal = value.slice(0, start) + "  " + value.slice(end);
        handleChange(newVal);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
      onKeyDownProp?.(e);
    },
    [readOnly, value, handleChange, onKeyDownProp, openFind]
  );

  const gutterWidth = showLineNumbers ? Math.max(String(lines.length).length * 10 + 16, 36) : 0;
  /* Content padding left = gutter + --spacing-code-editor (via calc in style) */

  if (customContent != null) {
    return (
      <div
        className={cn("code-editor-wrapper relative z-0 overflow-hidden", fillHeight && "h-full min-h-0", className)}
        data-language={language}
        style={fillHeight ? { height: "100%", minHeight: 0 } : undefined}
      >
        <div
          className={cn("overflow-auto", !customContentNoPad && "code-editor-pad")}
          style={
            fillHeight
              ? { height: "100%", minHeight: 0 }
              : { minHeight: 200, maxHeight: "88vh" }
          }
        >
          {customContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("code-editor-wrapper relative z-0 overflow-hidden", fillHeight && "h-full min-h-0", className)}
      data-language={language}
      style={fillHeight ? { height: "100%", minHeight: 0 } : undefined}
    >
      {showLineNumbers && (
        <div
          ref={gutterRef}
          className="absolute left-0 top-0 bottom-0 select-none overflow-hidden z-[2] pointer-events-none"
          style={{
            width: gutterWidth,
            minWidth: gutterWidth > 0 ? "var(--code-gutter-min-width)" : undefined,
            borderRight: "1px solid hsl(var(--code-border))",
            background: "hsl(var(--code-bg))",
          }}
        >
          <div className="code-editor-gutter">
            {lines.map((_, i) => (
              <div
                key={`L${i}`}
                className="code-editor-gutter__cell text-right flex items-center justify-end"
                style={{
                  height: "calc(var(--code-line-height) * 1em)",
                  lineHeight: "var(--code-line-height)",
                  color: errorLines?.has(i + 1) ? "hsl(var(--destructive))" : "hsl(var(--code-gutter-foreground))",
                  fontWeight: errorLines?.has(i + 1) ? 600 : 400,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={highlightRef}
        aria-hidden
        className="code-editor-pad absolute top-0 bottom-0 right-0 overflow-hidden pointer-events-none z-[1] whitespace-pre"
        style={{ left: gutterWidth, lineHeight: "var(--code-line-height)" }}
      >
        {tokenizedLines.map((tokens, i) => (
          <HighlightLine
            key={`L${i}`}
            tokens={tokens}
            isError={errorLines?.has(i + 1) ?? false}
            isFindMatch={activeMatchLine === i + 1}
            colors={colors}
          />
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        aria-label={textareaAriaLabel}
        className="code-editor-content relative z-[3] w-full h-full bg-transparent border-none outline-none resize-y overflow-auto"
        style={{
          padding: "var(--spacing-code-editor)",
          paddingLeft: gutterWidth > 0 ? `calc(${gutterWidth}px + var(--spacing-code-editor))` : "var(--spacing-code-editor)",
          lineHeight: "var(--code-line-height)",
          color: "transparent",
          caretColor: "hsl(var(--foreground))",
          whiteSpace: "pre",
          ...(fillHeight
            ? { height: "100%", minHeight: 0, maxHeight: "none" }
            : { minHeight: 680, maxHeight: "88vh" }),
        }}
      />

      {findOpen && (
        <div className="code-editor-find absolute top-2 right-3 z-[4] flex items-center gap-0.5 rounded-md border border-border bg-popover px-1.5 py-1 shadow-md">
          <input
            ref={findInputRef}
            value={findQuery}
            onChange={(e) => {
              setFindQuery(e.target.value);
              setActiveMatch(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                closeFind();
              } else if (e.key === "Enter") {
                e.preventDefault();
                gotoMatch(e.shiftKey ? -1 : 1);
              } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
                e.preventDefault();
                findInputRef.current?.select();
              }
            }}
            placeholder="Find"
            aria-label="Find in editor"
            className="w-32 bg-transparent px-1 text-xs outline-none placeholder:text-muted-foreground"
          />
          <span className="min-w-[3rem] px-1 text-center text-[11px] tabular-nums text-muted-foreground">
            {findQuery ? `${matches.length ? activeIdx + 1 : 0}/${matches.length}` : ""}
          </span>
          <button
            type="button"
            onClick={() => gotoMatch(-1)}
            disabled={!matches.length}
            aria-label="Previous match"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => gotoMatch(1)}
            disabled={!matches.length}
            aria-label="Next match"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted disabled:opacity-40"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={closeFind}
            aria-label="Close find"
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

export default CodeEditor;
