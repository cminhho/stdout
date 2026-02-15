import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";
type TextMode = "formatted" | "minified";

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

const SQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "INSERT", "INTO", "VALUES",
  "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "ALTER", "DROP", "INDEX",
  "JOIN", "LEFT", "RIGHT", "INNER", "OUTER", "FULL", "CROSS", "ON",
  "GROUP", "BY", "ORDER", "ASC", "DESC", "HAVING", "LIMIT", "OFFSET",
  "UNION", "ALL", "AS", "IN", "EXISTS", "BETWEEN", "LIKE", "IS", "NULL",
  "CASE", "WHEN", "THEN", "ELSE", "END", "DISTINCT", "COUNT", "SUM",
  "AVG", "MIN", "MAX", "WITH", "RETURNING",
];

const PG_KEYWORDS = ["ILIKE", "RETURNING", "SERIAL", "BIGSERIAL", "BOOLEAN", "TEXT", "JSONB", "UUID", "ARRAY", "LATERAL", "MATERIALIZED", "CONCURRENTLY"];
const MYSQL_KEYWORDS = ["AUTO_INCREMENT", "ENGINE", "CHARSET", "COLLATE", "UNSIGNED", "ENUM", "TINYINT", "MEDIUMINT", "LONGTEXT", "MEDIUMTEXT", "IF", "IGNORE", "REPLACE"];

type Dialect = "standard" | "postgresql" | "mysql";

const DIALECT_EXTRAS: Record<Dialect, string[]> = {
  standard: [],
  postgresql: PG_KEYWORDS,
  mysql: MYSQL_KEYWORDS,
};

const BREAK_BEFORE = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "JOIN", "LEFT", "RIGHT", "INNER",
  "OUTER", "FULL", "CROSS", "GROUP", "ORDER", "HAVING", "LIMIT", "OFFSET",
  "UNION", "INSERT", "UPDATE", "DELETE", "SET", "VALUES", "ON", "WITH",
  "RETURNING",
]);

type KeywordCase = "upper" | "lower";
type IdentifierCase = "as-is" | "upper" | "lower";

const applyCase = (s: string, mode: KeywordCase | IdentifierCase): string => {
  if (mode === "upper") return s.toUpperCase();
  if (mode === "lower") return s.toLowerCase();
  return s;
};

const formatSql = (sql: string, indent: number, dialect: Dialect, keywordCase: KeywordCase, identifierCase: IdentifierCase): string => {
  const tab = " ".repeat(indent);
  const allKeywords = [...SQL_KEYWORDS, ...DIALECT_EXTRAS[dialect]];
  const keywordSet = new Set(allKeywords.map((k) => k.toUpperCase()));
  const tokens = sql.replace(/\s+/g, " ").replace(/,/g, ",\n" + tab + tab).split(" ").filter(Boolean);
  let result = "";
  for (const token of tokens) {
    const upper = token.toUpperCase().replace(/\n/g, "").trim();
    if (BREAK_BEFORE.has(upper)) {
      const kw = applyCase(token, keywordCase);
      if (upper === "AND" || upper === "OR") {
        result += "\n" + tab.repeat(1) + kw + " ";
      } else {
        result += "\n" + kw + " ";
      }
    } else if (keywordSet.has(upper)) {
      result += applyCase(token, keywordCase) + " ";
    } else {
      result += applyCase(token, identifierCase) + " ";
    }
  }
  return result.trim();
};

const minifySql = (sql: string): string =>
  sql.replace(/\s+/g, " ").replace(/\s*([(),])\s*/g, "$1").trim();

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const SqlFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(
    "SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email ORDER BY order_count DESC LIMIT 50"
  );
  const [indent, setIndent] = useState(2);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [identifierCase, setIdentifierCase] = useState<IdentifierCase>("as-is");
  const [dialect, setDialect] = useState<Dialect>("standard");
  const [textMode, setTextMode] = useState<TextMode>("formatted");
  const [optionsOpen, setOptionsOpen] = useState(true);

  const output = useMemo(
    () =>
      textMode === "formatted"
        ? formatSql(input, indent, dialect, keywordCase, identifierCase)
        : minifySql(input),
    [input, indent, dialect, keywordCase, identifierCase, textMode]
  );

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

  return (
    <ToolLayout title={tool?.label ?? "SQL Formatter"} description={tool?.description ?? "Format and beautify SQL queries"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".sql,text/x-sql,application/sql"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload your SQL file">
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
            </OptionField>
            <OptionField label="File encoding">
              <select
                value={fileEncoding}
                onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
                className={selectClass}
              >
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
              </select>
            </OptionField>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Indentation level">
              <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className={selectClass}>
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </OptionField>
            <OptionField label="Change of keywords">
              <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as KeywordCase)} className={selectClass}>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </OptionField>
            <OptionField label="Case of identifiers">
              <select value={identifierCase} onChange={(e) => setIdentifierCase(e.target.value as IdentifierCase)} className={selectClass}>
                <option value="as-is">As-is</option>
                <option value="upper">Uppercase</option>
                <option value="lower">Lowercase</option>
              </select>
            </OptionField>
            <OptionField label="Dialect">
              <select value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)} className={selectClass}>
                <option value="standard">Standard SQL</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </OptionField>
            <OptionField label="Text mode">
              <select value={textMode} onChange={(e) => setTextMode(e.target.value as TextMode)} className={selectClass}>
                <option value="formatted">Formatted</option>
                <option value="minified">Minified</option>
              </select>
            </OptionField>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input SQL" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="sql" placeholder="SELECT * FROM users WHERE ..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="sql" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default SqlFormatterPage;
