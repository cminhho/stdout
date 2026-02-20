/**
 * JSON → Table (parse JSON array/object to headers + rows). Single place for logic and constants.
 */

export const JSON_TABLE_FILE_ACCEPT = ".json,application/json";
export const JSON_TABLE_SAMPLE = '[{"name": "Alice", "age": 30, "city": "NYC"}, {"name": "Bob", "age": 25, "city": "LA"}]';
export const JSON_TABLE_PLACEHOLDER = '[{"name": "Alice", "age": 30}]';

export interface JsonTableData {
  headers: string[];
  rows: string[][];
}

export interface ParseJsonTableResult {
  data: JsonTableData | null;
  error: string;
}

export function parseJsonToTable(input: string): ParseJsonTableResult {
  if (!input.trim()) return { data: null, error: "" };
  try {
    const parsed = JSON.parse(input);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    if (arr.length === 0) return { data: { headers: [], rows: [] }, error: "" };
    const headers = [...new Set(arr.flatMap((item: Record<string, unknown>) => Object.keys(item)))];
    const rows = arr.map((item: Record<string, unknown>) =>
      headers.map((h) => {
        const v = item[h];
        return v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      })
    );
    return { data: { headers, rows }, error: "" };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}
