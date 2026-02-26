import { useRef, useCallback, useEffect, useMemo } from "react";

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
  | "csv"
  | "curl"
  | "javascript"
  | "typescript"
  | "go"
  | "java"
  | "kotlin"
  | "plaintext"
  | "randomstring";

/** Metadata passed when content changes; useful for line-by-line handling without re-splitting. */
export interface CodeEditorChangeMeta {
  /** Current lines (value split by "\n"). Same reference until value changes. */
  lines: string[];
  /** Number of lines. */
  lineCount: number;
}

interface CodeEditorProps {
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

const REGEX_SQL_KEYWORDS =
  /\b(SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|SET|CREATE|ALTER|DROP|TABLE|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|EXISTS|BETWEEN|LIKE|CASE|WHEN|THEN|ELSE|END|BEGIN|COMMIT|ROLLBACK|VALUES|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|CONSTRAINT|CHECK|UNIQUE|INT|VARCHAR|TEXT|BOOLEAN|DATE|TIMESTAMP|FLOAT|DOUBLE|DECIMAL|IF|GRANT|REVOKE|WITH|RECURSIVE|FETCH|CURSOR|DECLARE)\b/gi;
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
      REGEX_SQL_KEYWORDS.lastIndex = 0;
      if (REGEX_SQL_KEYWORDS.test(match[10])) {
        tokens.push({ type: "keyword", value: match[10] });
      } else {
        tokens.push({ type: "text", value: match[10] });
      }
    } else if (match[11]) tokens.push({ type: "text", value: match[11] });
    lastIndex = REGEX_SQL.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const REGEX_YAML = /(#.*$)|([a-zA-Z_][\w.-]*)(\s*:)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(true|false|yes|no|on|off)\b|(null|~)\b|([-+]?\d+\.?\d*(?:[eE][+-]?\d+)?)\b|(-\s)|([|>][-+]?)|(.+)/g;

const tokenizeYaml = (line: string): Token[] => {
  const tokens: Token[] = [];
  REGEX_YAML.lastIndex = 0;
  let match: RegExpExecArray | null;
  let lastIndex = 0;
  while ((match = REGEX_YAML.exec(line)) !== null) {
    if (match.index > lastIndex) tokens.push({ type: "text", value: line.slice(lastIndex, match.index) });
    if (match[1]) tokens.push({ type: "comment", value: match[1] });
    else if (match[2]) { tokens.push({ type: "key", value: match[2] }); tokens.push({ type: "punctuation", value: match[3] }); }
    else if (match[4]) tokens.push({ type: "string", value: match[4] });
    else if (match[5]) tokens.push({ type: "boolean", value: match[5] });
    else if (match[6]) tokens.push({ type: "null", value: match[6] });
    else if (match[7]) tokens.push({ type: "number", value: match[7] });
    else if (match[8]) tokens.push({ type: "punctuation", value: match[8] });
    else if (match[9]) tokens.push({ type: "keyword", value: match[9] });
    else if (match[10]) tokens.push({ type: "text", value: match[10] });
    lastIndex = REGEX_YAML.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizeXml = tokenizeHtml;
const tokenizeSvg = tokenizeHtml;

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

const REGEX_CODE_KEYWORDS =
  /\b(interface|type|class|function|const|let|var|import|export|from|return|if|else|for|while|switch|case|break|continue|new|this|extends|implements|public|private|protected|static|readonly|abstract|async|await|try|catch|throw|finally|void|null|undefined|true|false|struct|func|package|data|val|var|fun|override|companion|object|sealed|enum|int|string|boolean|number|float|double|long|byte|char|short)\b/g;
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
      REGEX_CODE_KEYWORDS.lastIndex = 0;
      tokens.push({ type: REGEX_CODE_KEYWORDS.test(match[5]) ? "keyword" : "text", value: match[5] });
    } else if (match[6]) tokens.push({ type: "text", value: match[6] });
    lastIndex = REGEX_CODE.lastIndex;
  }
  if (lastIndex < line.length) tokens.push({ type: "text", value: line.slice(lastIndex) });
  return tokens;
};

const tokenizePlain = (line: string): Token[] => [{ type: "text", value: line }];

/** Random string / password view: colorize digits, uppercase, lowercase, symbols (industry practice for readability). */
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
    case "csv": return tokenizeCsv;
    case "curl": return tokenizeCurl;
    case "javascript": case "typescript": case "go": case "java": case "kotlin": return tokenizeCode;
    case "randomstring": return tokenizeRandomString;
    case "text": case "plaintext": return tokenizePlain;
    default: return tokenizePlain;
  }
};

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

/* Random string view: distinct colors per character type (digit / upper / lower / symbol) for quick scan */
const randomStringTokenColors: Record<Token["type"], string> = {
  ...tokenColors,
  number: "hsl(var(--code-rs-digit))",
  keyword: "hsl(var(--code-rs-upper))",
  string: "hsl(var(--code-rs-lower))",
  punctuation: "hsl(var(--code-rs-symbol))",
  text: "hsl(var(--foreground))",
};

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

const CodeEditor = ({
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
  ariaLabel,
}: CodeEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => (value ? value.split("\n") : [""]), [value]);
  const tokenizer = useMemo(() => getTokenizer(language), [language]);
  const tokenizedLines = useMemo(() => lines.map((line) => tokenizer(line)), [lines, tokenizer]);

  const textareaAriaLabel = ariaLabel ?? (readOnly ? `Code view, ${language}` : undefined);

  useCodeEditorScrollSync(textareaRef, highlightRef, gutterRef);

  const handleChange = useCallback(
    (newValue: string) => {
      const newLines = newValue ? newValue.split("\n") : [""];
      onChange?.(newValue, { lines: newLines, lineCount: newLines.length });
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    [readOnly, value, handleChange, onKeyDownProp]
  );

  const gutterWidth = showLineNumbers ? Math.max(String(lines.length).length * 10 + 16, 36) : 0;
  const contentPaddingLeft = gutterWidth + 12;

  if (customContent != null) {
    return (
      <div
        className={`code-editor-wrapper relative z-0 overflow-hidden ${fillHeight ? "h-full min-h-0" : ""} ${className}`}
        data-language={language}
        style={fillHeight ? { height: "100%", minHeight: 0 } : undefined}
      >
        <div
          className="code-editor-pad overflow-auto"
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
      className={`code-editor-wrapper relative z-0 overflow-hidden ${fillHeight ? "h-full min-h-0" : ""} ${className}`}
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
          <div className="pt-[var(--spacing-code-editor)] pb-[var(--spacing-code-editor)]">
            {lines.map((_, i) => (
              <div
                key={`L${i}`}
                className="text-right pr-2 flex items-center justify-end"
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
          <div
            key={`L${i}`}
            className="whitespace-pre"
            style={{
              height: "calc(var(--code-line-height) * 1em)",
              lineHeight: "var(--code-line-height)",
              background: errorLines?.has(i + 1) ? "hsl(var(--destructive) / 0.08)" : "transparent",
            }}
          >
            {tokens.length === 0
              ? "\n"
              : tokens.map((token, j) => (
                  <span
                    key={j}
                    style={{
                      color: (language === "randomstring" ? randomStringTokenColors : tokenColors)[token.type],
                    }}
                  >
                    {token.value}
                  </span>
                ))}
          </div>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={readOnly ? undefined : handleKeyDown}
        readOnly={readOnly}
        placeholder={placeholder}
        spellCheck={false}
        aria-label={textareaAriaLabel}
        className="relative z-[3] w-full h-full bg-transparent border-none outline-none resize-y overflow-auto"
        style={{
          padding: "var(--spacing-code-editor)",
          paddingLeft: contentPaddingLeft,
          lineHeight: "var(--code-line-height)",
          color: "transparent",
          caretColor: "hsl(var(--foreground))",
          whiteSpace: "pre",
          ...(fillHeight
            ? { height: "100%", minHeight: 0, maxHeight: "none" }
            : { minHeight: 680, maxHeight: "88vh" }),
        }}
      />
    </div>
  );
};

export default CodeEditor;
