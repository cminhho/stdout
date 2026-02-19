import { useState, useMemo } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";

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
const MARIADB_KEYWORDS = [...MYSQL_KEYWORDS, "SEQUENCE", "PERSISTENT", "STATIC", "VIRTUAL"];
const PLSQL_KEYWORDS = ["DECLARE", "BEGIN", "END", "LOOP", "FOR", "WHILE", "IF", "ELSIF", "ELSE", "EXCEPTION", "EXIT", "CONTINUE", "RETURN", "PROCEDURE", "FUNCTION", "PACKAGE", "BODY", "TYPE", "RECORD", "TABLE", "CURSOR", "OPEN", "FETCH", "CLOSE", "RAISE", "PRAGMA", "EXECUTE", "IMMEDIATE", "COMMIT", "ROLLBACK", "SAVEPOINT", "BOOLEAN", "BINARY_INTEGER", "PLS_INTEGER", "NUMBER", "VARCHAR2", "DATE", "TIMESTAMP", "%TYPE", "%ROWTYPE", "OUT", "IN", "INOUT", "NOCOPY"];

type Dialect = "standard" | "mysql" | "mariadb" | "postgresql" | "plsql";

const DIALECT_EXTRAS: Record<Dialect, string[]> = {
  standard: [],
  mysql: MYSQL_KEYWORDS,
  mariadb: MARIADB_KEYWORDS,
  postgresql: PG_KEYWORDS,
  plsql: PLSQL_KEYWORDS,
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

const formatSql = (sql: string, indent: 2 | 3 | 4 | 8 | "tab", dialect: Dialect, keywordCase: KeywordCase, identifierCase: IdentifierCase): string => {
  const tab = indent === "tab" ? "\t" : " ".repeat(indent);
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
  const [input, setInput] = useState(
    "SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = true AND u.created_at > '2024-01-01' GROUP BY u.id, u.name, u.email ORDER BY order_count DESC LIMIT 50"
  );
  const [indent, setIndent] = useState<IndentOption>(2);
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [identifierCase, setIdentifierCase] = useState<IdentifierCase>("as-is");
  const [dialect, setDialect] = useState<Dialect>("standard");

  const output = useMemo(
    () =>
      indent === "minified"
        ? minifySql(input)
        : formatSql(input, indent, dialect, keywordCase, identifierCase),
    [input, indent, dialect, keywordCase, identifierCase]
  );

  const loadSample = () => setInput(SAMPLE_SQL);
  const clearInput = () => setInput("");

  return (
    <ToolLayout title={tool?.label ?? "SQL Formatter"} description={tool?.description ?? "Format and beautify SQL queries"}>
      <ResizableTwoPanel
        defaultInputPercent={50}
        input={{
          toolbar: (
            <>
              <SampleButton onClick={loadSample} />
              <ClearButton onClick={clearInput} />
              <FileUploadButton accept=".sql,text/x-sql,application/sql" onText={setInput} />
              <select value={dialect} onChange={(e) => setDialect(e.target.value as Dialect)} className={selectClass} title="Dialect">
                <option value="standard">Standard</option>
                <option value="mysql">MySQL</option>
                <option value="mariadb">MariaDB</option>
                <option value="postgresql">PostgreSQL</option>
                <option value="plsql">PL/SQL</option>
              </select>
            </>
          ),
          children: (
            <CodeEditor value={input} onChange={setInput} language="sql" placeholder="SELECT * FROM users WHERE ..." fillHeight />
          ),
        }}
        output={{
          copyText: output,
          toolbar: (
            <>
              <select value={keywordCase} onChange={(e) => setKeywordCase(e.target.value as KeywordCase)} className={selectClass} title="Keyword case">
                <option value="upper">Keywords: Upper</option>
                <option value="lower">Keywords: Lower</option>
              </select>
              <select value={identifierCase} onChange={(e) => setIdentifierCase(e.target.value as IdentifierCase)} className={selectClass} title="Identifier case">
                <option value="as-is">Identifiers: As-is</option>
                <option value="upper">Identifiers: Upper</option>
                <option value="lower">Identifiers: Lower</option>
              </select>
              <IndentSelect value={indent} onChange={setIndent} className={selectClass} />
              {output ? (
                <SaveButton content={output} filename="output.sql" mimeType="application/sql" />
              ) : null}
            </>
          ),
          children: (
            <CodeEditor key={`result-${indent}-${dialect}-${keywordCase}-${identifierCase}`} value={output} readOnly language="sql" placeholder="Result will appear here..." fillHeight />
          ),
        }}
      />
    </ToolLayout>
  );
};

export default SqlFormatterPage;
