/**
 * CSV → XML converter. Single place for conversion logic and constants.
 */

import type { IndentOption } from "@/components/IndentSelect";

export const CSV_XML_FILE_ACCEPT = ".csv,text/csv";
export const CSV_XML_SAMPLE_CSV = "name,age,city\nAlice,30,NYC\nBob,25,LA";
export const CSV_XML_PLACEHOLDER_CSV = "name,age,city\nAlice,30,NYC";
export const CSV_XML_PLACEHOLDER_OUTPUT = "Result...";

export function csvToRows(csv: string, delimiter: string): string[][] {
  const lines = csv.trim().split("\n");
  if (lines.length === 0) return [];
  return lines.map((line) => {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          current += c;
        }
      } else if (c === delimiter) {
        row.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    row.push(current.trim());
    return row;
  });
}

export function csvToXml(
  csv: string,
  rootTag: string,
  rowTag: string,
  delimiter: string,
  indentOption: IndentOption
): string {
  const rows = csvToRows(csv, delimiter);
  if (rows.length < 2) return `<?xml version="1.0"?>\n<${rootTag}/>`;
  const headers = rows[0];
  const minified = indentOption === "minified";
  const indentStr = minified ? "" : indentOption === "tab" ? "\t" : " ".repeat(indentOption as number);
  const nl = minified ? "" : "\n";
  let out = `<?xml version="1.0"?>${nl}<${rootTag}>${nl}`;
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    out += (minified ? "" : indentStr) + `<${rowTag}>${nl}`;
    for (let c = 0; c < headers.length; c++) {
      const tag = headers[c].replace(/[^a-zA-Z0-9_-]/g, "_") || "col" + c;
      const val = (row[c] ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      out += (minified ? "" : indentStr + indentStr) + `<${tag}>${val}</${tag}>${nl}`;
    }
    out += (minified ? "" : indentStr) + `</${rowTag}>${nl}`;
  }
  out += `</${rootTag}>`;
  return out;
}
