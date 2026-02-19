/**
 * SQL formatter: format, minify. Single place for SQL formatter logic.
 */

import type { IndentOption } from "@/components/IndentSelect";

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

export type SqlDialect = "standard" | "mysql" | "mariadb" | "postgresql" | "plsql";
export type SqlKeywordCase = "upper" | "lower";
export type SqlIdentifierCase = "as-is" | "upper" | "lower";

const DIALECT_EXTRAS: Record<SqlDialect, string[]> = {
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

function applyCase(s: string, mode: SqlKeywordCase | SqlIdentifierCase): string {
  if (mode === "upper") return s.toUpperCase();
  if (mode === "lower") return s.toLowerCase();
  return s;
}

export const SQL_FILE_ACCEPT = ".sql,text/x-sql,application/sql";
export const SQL_OUTPUT_FILENAME = "output.sql";
export const SQL_MIME_TYPE = "application/sql";
export const SQL_LANGUAGE = "sql";
export const SQL_INPUT_PLACEHOLDER = "SELECT * FROM users WHERE ...";
export const SQL_OUTPUT_PLACEHOLDER = "Result will appear here...";

export const SQL_FORMATTER_SAMPLE = `SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.active = true AND u.created_at > '2024-01-01'
GROUP BY u.id, u.name, u.email
ORDER BY order_count DESC
LIMIT 50`;

export function formatSql(
  sql: string,
  indent: 2 | 3 | 4 | 8 | "tab",
  dialect: SqlDialect,
  keywordCase: SqlKeywordCase,
  identifierCase: SqlIdentifierCase
): string {
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
}

export function minifySql(sql: string): string {
  return sql.replace(/\s+/g, " ").replace(/\s*([(),])\s*/g, "$1").trim();
}

export function processSqlInput(
  sql: string,
  indent: IndentOption,
  dialect: SqlDialect,
  keywordCase: SqlKeywordCase,
  identifierCase: SqlIdentifierCase
): string {
  return indent === "minified"
    ? minifySql(sql)
    : formatSql(sql, indent as 2 | 3 | 4 | 8 | "tab", dialect, keywordCase, identifierCase);
}
