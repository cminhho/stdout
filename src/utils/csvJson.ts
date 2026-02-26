/**
 * CSV ↔ JSON converter. Single place for conversion logic and constants.
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const CSV_JSON_FILE_ACCEPT = ".csv,.json,text/csv,application/json";

export const CSV_JSON_SAMPLE_CSV = "name,age,city\nAlice,30,NYC\nBob,25,LA";
export const CSV_JSON_SAMPLE_JSON = '[{"name":"Alice","age":30,"city":"NYC"},{"name":"Bob","age":25,"city":"LA"}]';

export const CSV_JSON_PLACEHOLDER_CSV = "name,age,city\nAlice,30,NYC\nBob,25,LA";
export const CSV_JSON_PLACEHOLDER_JSON = '[{"name":"Alice","age":30}]';
export const CSV_JSON_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const CSV_JSON_OUTPUT_FILENAME_JSON = "output.json";
export const CSV_JSON_OUTPUT_FILENAME_CSV = "output.csv";
export const CSV_JSON_MIME_JSON = "application/json";
export const CSV_JSON_MIME_CSV = "text/csv";

export type CsvJsonMode = "csv2json" | "json2csv";

export interface CsvJsonFormatResult {
  output: string;
  errors?: ParseError[];
}

export function processCsvJson(input: string, indent: IndentOption, mode: CsvJsonMode): CsvJsonFormatResult {
  if (!input.trim()) return { output: "", errors: [] };
  try {
    if (mode === "csv2json") {
      const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
      return { output: JSON.stringify(csvToJson(input), null, space), errors: [] };
    }
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array");
    return { output: jsonToCsv(parsed), errors: [] };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}

export function csvToJson(csv: string, delimiter = ","): unknown[] {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
}

export function jsonToCsv(json: unknown[]): string {
  if (!Array.isArray(json) || json.length === 0) return "";
  const headers = [...new Set(json.flatMap((item) => Object.keys(item as Record<string, unknown>)))];
  const rows = json.map((item) => {
    const obj = item as Record<string, unknown>;
    return headers.map((h) => {
      const v = String(obj[h] ?? "");
      return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
}
