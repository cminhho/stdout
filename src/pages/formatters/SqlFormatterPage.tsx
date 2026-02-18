import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";

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

const SAMPLE_SQL = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true AND u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email
ORDER BY order_count DESC
LIMIT 50`;

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

  const inputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_SQL)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".sql,text/x-sql,application/sql"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
      <select
        value={fileEncoding}
        onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
        className={selectClass}
        title="File encoding"
      >
        <option value="utf-8">UTF-8</option>
        <option value="utf-16le">UTF-16 LE</option>
        <option value="utf-16be">UTF-16 BE</option>
      </select>
    </div>
  );

  const outputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className={selectClass} title="Indentation">
        <option value={2}>2 spaces</option>
        <option value={4}>4 spaces</option>
        <option value={8}>8 spaces</option>
      </select>
      <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as KeywordCase)} className={selectClass} title="Keyword case">
        <option value="upper">Keywords: Upper</option>
        <option value="lower">Keywords: Lower</option>
      </select>
      <select value={identifierCase} onChange={(e) => setIdentifierCase(e.target.value as IdentifierCase)} className={selectClass} title="Identifier case">
        <option value="as-is">Identifiers: As-is</option>
        <option value="upper">Identifiers: Upper</option>
        <option value="lower">Identifiers: Lower</option>
      </select>
      <select value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)} className={selectClass} title="Dialect">
        <option value="standard">Standard SQL</option>
        <option value="postgresql">PostgreSQL</option>
        <option value="mysql">MySQL</option>
      </select>
      <select value={textMode} onChange={(e) => setTextMode(e.target.value as TextMode)} className={selectClass} title="Mode">
        <option value="formatted">Formatted</option>
        <option value="minified">Minified</option>
      </select>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "SQL Formatter"} description={tool?.description ?? "Format and beautify SQL queries"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Input SQL" extra={inputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="sql" placeholder="SELECT * FROM users WHERE ..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} extra={outputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="sql" placeholder="Result will appear here..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default SqlFormatterPage;
