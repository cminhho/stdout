import { useState, useMemo, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, Settings2, AlignLeft, Network, Download } from "lucide-react";
import { JsonView, defaultStyles, darkStyles, allExpanded } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import { useSettings } from "@/hooks/useSettings";

// ── Strict JSON Validator (RFC 8259 / ECMA-404 compliant) ──────────────────

interface ValidationError {
  line: number;
  column: number;
  message: string;
  snippet: string;
}

const strictValidateJson = (input: string): { valid: boolean; errors: ValidationError[]; parsed?: unknown } => {
  const errors: ValidationError[] = [];
  const lines = input.split("\n");

  const getPosition = (pos: number) => {
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
  };

  const getSnippet = (lineNum: number) => {
    const l = lines[lineNum - 1] || "";
    return l.length > 80 ? l.slice(0, 80) + "…" : l;
  };

  const trailingCommaRegex = /,\s*([}\]])/g;
  let match;
  while ((match = trailingCommaRegex.exec(input)) !== null) {
    const pos = getPosition(match.index);
    errors.push({
      line: pos.line,
      column: pos.col,
      message: "Trailing comma before closing bracket/brace",
      snippet: getSnippet(pos.line),
    });
  }

  const singleQuoteRegex = /(?<!")'\s*[^']*'\s*(?!["\\])/g;
  const stripped = input.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  let sqMatch;
  while ((sqMatch = singleQuoteRegex.exec(stripped)) !== null) {
    const pos = getPosition(sqMatch.index);
    errors.push({
      line: pos.line,
      column: pos.col,
      message: 'Single quotes are not valid in JSON. Use double quotes (")',
      snippet: getSnippet(pos.line),
    });
  }

  const unquotedKeyRegex = /(?:^|[{,])\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/gm;
  let ukMatch;
  while ((ukMatch = unquotedKeyRegex.exec(stripped)) !== null) {
    if (!["true", "false", "null"].includes(ukMatch[1])) {
      const pos = getPosition(ukMatch.index + ukMatch[0].indexOf(ukMatch[1]));
      errors.push({
        line: pos.line,
        column: pos.col,
        message: `Unquoted key "${ukMatch[1]}". Keys must be wrapped in double quotes`,
        snippet: getSnippet(pos.line),
      });
    }
  }

  const commentRegex = /(\/\/.*|\/\*[\s\S]*?\*\/)/g;
  let cmMatch;
  while ((cmMatch = commentRegex.exec(stripped)) !== null) {
    const pos = getPosition(cmMatch.index);
    errors.push({
      line: pos.line,
      column: pos.col,
      message: "Comments are not allowed in JSON",
      snippet: getSnippet(pos.line),
    });
  }

  try {
    const parsed = JSON.parse(input);
    return { valid: errors.length === 0, errors, parsed };
  } catch (e) {
    const msg = (e as Error).message;
    const posMatch = msg.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = getPosition(Number(posMatch[1]));
      errors.push({
        line: pos.line,
        column: pos.col,
        message: msg.replace(/^JSON\.parse:\s*/i, "").replace(/^Unexpected/i, "Unexpected"),
        snippet: getSnippet(pos.line),
      });
    } else {
      const lineMatch = msg.match(/line\s+(\d+)/i);
      const colMatch = msg.match(/column\s+(\d+)/i);
      errors.push({
        line: lineMatch ? Number(lineMatch[1]) : 1,
        column: colMatch ? Number(colMatch[1]) : 1,
        message: msg,
        snippet: getSnippet(lineMatch ? Number(lineMatch[1]) : 1),
      });
    }
    return { valid: false, errors };
  }
};

const computeStats = (parsed: unknown) => {
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
};

type IndentOption = 2 | 3 | 4 | "tab" | "compact";
type BracketStyle = "expanded" | "collapsed";
type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const INDENT_OPTIONS: { value: IndentOption; label: string }[] = [
  { value: 2, label: "2 spaces" },
  { value: 3, label: "3 spaces" },
  { value: 4, label: "4 spaces" },
  { value: "tab", label: "Tab" },
  { value: "compact", label: "Compact (1 line)" },
];

const readFileAsText = (file: File, encoding: FileEncoding): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      if (result instanceof ArrayBuffer) {
        const enc = encoding === "utf-16le" ? "utf-16le" : encoding === "utf-16be" ? "utf-16be" : "utf-8";
        resolve(new TextDecoder(enc).decode(result));
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    if (encoding === "utf-8") {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const JsonFormatter = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme } = useSettings();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(4);
  const [bracketStyle, setBracketStyle] = useState<BracketStyle>("expanded");
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [resultView, setResultView] = useState<"text" | "tree">("tree");

  const isMinified = bracketStyle === "collapsed" || indent === "compact";

  /** Tree view indent: padding per nesting level to match Indent option. */
  const treeIndentClass = useMemo(() => {
    switch (indent) {
      case 2:
        return "[&_.child-fields-container]:pl-2";
      case 3:
        return "[&_.child-fields-container]:pl-3";
      case 4:
        return "[&_.child-fields-container]:pl-4";
      case "tab":
        return "[&_.child-fields-container]:pl-8";
      case "compact":
        return "[&_.child-fields-container]:pl-1";
      default:
        return "[&_.child-fields-container]:pl-4";
    }
  }, [indent]);

  const jsonViewStyles = useMemo(() => {
    const base = theme === "dark" ? darkStyles : defaultStyles;
    return { ...base, childFieldsContainer: base.childFieldsContainer + " list-none pl-0" };
  }, [theme]);

  const { formatted, minified, errors, stats, isValid, parsedData } = useMemo(() => {
    if (!input.trim())
      return { formatted: "", minified: "", errors: [] as ValidationError[], stats: null, isValid: null, parsedData: undefined as unknown };
    const result = strictValidateJson(input);
    if (!result.parsed || result.errors.length > 0) {
      return { formatted: "", minified: "", errors: result.errors, stats: null, isValid: false, parsedData: undefined as unknown };
    }
    const data = result.parsed;
    const space = indent === "compact" ? undefined : indent === "tab" ? "\t" : indent;
    return {
      formatted: JSON.stringify(data, null, space),
      minified: JSON.stringify(data),
      errors: result.errors,
      stats: computeStats(result.parsed),
      isValid: result.valid,
      parsedData: data,
    };
  }, [input, indent]);

  const output = isMinified ? minified : formatted;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file, fileEncoding);
      setInput(text);
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const errorLineSet = new Set(errors.map((e) => e.line));

  return (
    <ToolLayout
      title={tool?.label ?? "JSON Formatter"}
      description={tool?.description ?? "Format, validate & beautify JSON with strict RFC compliance"}
    >
      {/* Options — compact single row */}
      <div className="mb-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
        <button
          type="button"
          onClick={() => setOptionsOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5" />
            Options
          </span>
          <span className="text-[10px] opacity-75">{optionsOpen ? "▼" : "▶"}</span>
        </button>
        {optionsOpen && (
          <div className="px-3 py-2.5 border-t border-border/80 flex flex-wrap items-center gap-x-4 gap-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3 w-3 mr-1.5" />
              Upload file
            </Button>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">Encoding</span>
              <select
                value={fileEncoding}
                onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
                className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0"
              >
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">Indent</span>
              <select
                value={indent}
                onChange={(e) => setIndent(e.target.value as IndentOption)}
                className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0"
              >
                {INDENT_OPTIONS.map((opt) => (
                  <option key={String(opt.value)} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">Style</span>
              <select
                value={bracketStyle}
                onChange={(e) => setBracketStyle(e.target.value as BracketStyle)}
                className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0"
              >
                <option value="expanded">Expanded</option>
                <option value="collapsed">Collapsed</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Validation status + Stats */}
      {input.trim() && (
        <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
          {isValid !== null && (
            <span
              className={`px-2 py-0.5 rounded font-medium ${isValid ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}
            >
              {isValid ? "✓ Valid JSON" : `✗ ${errors.length} error${errors.length > 1 ? "s" : ""}`}
            </span>
          )}
          {stats &&
            [
              ["Keys", stats.keys],
              ["Depth", stats.depth],
              ["Objects", stats.objects],
              ["Arrays", stats.arrays],
              ["Size", stats.size],
            ].map(([label, value]) => (
              <span key={label as string} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {label}: <span className="font-mono font-medium text-foreground">{value}</span>
              </span>
            ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1.5 max-h-[120px] overflow-y-auto mb-3">
          {errors.map((err, i) => (
            <div key={i} className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs space-y-1">
              <div className="flex gap-2">
                <span className="font-mono text-destructive font-medium shrink-0">
                  Line {err.line}, Col {err.column}
                </span>
                <span className="text-foreground">{err.message}</span>
              </div>
              {err.snippet && (
                <pre className="font-mono text-muted-foreground text-[10px] bg-muted/50 rounded px-2 py-1 overflow-x-auto">
                  {err.snippet}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => setInput("")} />
          <CodeEditor
            value={input}
            onChange={setInput}
            language="json"
            placeholder="Copy-paste your JSON here..."
            errorLines={errorLineSet}
          />
        </div>

        {/* Output */}
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Result"
            text={output}
            extra={
              output ? (
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-md border border-input overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setResultView("text")}
                      className={`h-6 px-2 text-xs flex items-center gap-1 ${resultView === "text" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                      title="Text view"
                    >
                      <AlignLeft className="h-3 w-3" />
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setResultView("tree")}
                      className={`h-6 px-2 text-xs flex items-center gap-1 ${resultView === "tree" ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                      title="Tree view (collapse/expand)"
                    >
                      <Network className="h-3 w-3" />
                      Tree
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const blob = new Blob([output], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "output.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Save as file"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              ) : undefined
            }
          />
          <CodeEditor
            key={`result-${resultView}-${indent}-${bracketStyle}`}
            value={output}
            readOnly
            language="json"
            placeholder="Result will appear here..."
            fillHeight
            customContent={
              resultView === "tree" && parsedData !== undefined && typeof parsedData === "object" && parsedData !== null ? (
                <div className="flex w-full min-h-full">
                  <div
                    className="shrink-0 select-none pr-2 text-right border-r border-border text-muted-foreground/60 font-mono text-xs leading-relaxed"
                    style={{ width: 36, minHeight: `${Math.max(1, output.split("\n").length) * 1.625}em` }}
                    aria-hidden
                  >
                    {output.split("\n").map((_, i) => (
                      <div key={i} style={{ height: "1.625em" }}>
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className={`flex-1 min-w-0 pl-3 [&_.child-fields-container]:list-none [&_.child-fields-container]:pl-0 ${treeIndentClass}`}>
                    <JsonView
                      data={parsedData as object}
                      style={jsonViewStyles}
                      shouldExpandNode={allExpanded}
                      clickToExpandNode
                    />
                  </div>
                </div>
              ) : undefined
            }
          />
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonFormatter;
