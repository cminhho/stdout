import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

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

const formatSql = (sql: string, indent: number, dialect: Dialect): string => {
  const tab = " ".repeat(indent);
  const allKeywords = [...SQL_KEYWORDS, ...DIALECT_EXTRAS[dialect]];
  const keywordSet = new Set(allKeywords.map((k) => k.toUpperCase()));
  const tokens = sql.replace(/\s+/g, " ").replace(/,/g, ",\n" + tab + tab).split(" ").filter(Boolean);
  let result = "";
  for (const token of tokens) {
    const upper = token.toUpperCase().replace(/\n/g, "").trim();
    if (BREAK_BEFORE.has(upper)) {
      if (upper === "AND" || upper === "OR") {
        result += "\n" + tab.repeat(1) + token.toUpperCase() + " ";
      } else {
        result += "\n" + token.toUpperCase() + " ";
      }
    } else if (keywordSet.has(upper)) {
      result += token.toUpperCase() + " ";
    } else {
      result += token + " ";
    }
  }
  return result.trim();
};

const minifySql = (sql: string): string =>
  sql.replace(/\s+/g, " ").replace(/\s*([(),])\s*/g, "$1").trim();

const SqlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(
    "SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email ORDER BY order_count DESC LIMIT 50"
  );
  const [output, setOutput] = useState("");
  const [uppercase, setUppercase] = useState(true);
  const [indent, setIndent] = useState(2);
  const [dialect, setDialect] = useState<Dialect>("standard");

  const handleFormat = () => {
    let formatted = formatSql(input, indent, dialect);
    if (!uppercase) {
      const allKeywords = [...SQL_KEYWORDS, ...DIALECT_EXTRAS[dialect]];
      const regex = new RegExp(`\\b(${allKeywords.join("|")})\\b`, "gi");
      formatted = formatted.replace(regex, (m) => m.toLowerCase());
    }
    setOutput(formatted);
  };

  return (
    <ToolLayout title={tool?.label ?? "SQL Formatter"} description={tool?.description ?? "Format and beautify SQL queries"}>
      <div className="tool-toolbar">
        <select value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)} className="tool-select">
          <option value="standard">Standard SQL</option>
          <option value="postgresql">PostgreSQL</option>
          <option value="mysql">MySQL</option>
        </select>
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="tool-select">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={8}>8 spaces</option>
        </select>
        <label className="tool-checkbox-label">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
          Uppercase
        </label>
        <Button size="sm" onClick={handleFormat}>Format</Button>
        <Button size="sm" variant="outline" onClick={() => setOutput(minifySql(input))}>Minify</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input SQL" text={input} onClear={() => { setInput(""); setOutput(""); }} />
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
