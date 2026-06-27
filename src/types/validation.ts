/**
 * Shared validation types for formatter/validator tools (JSON, XML, CSV, JS, HTML, CSS).
 * Use ParseError for line/column errors; ValidationResult for a generic validate-only result.
 */

/** Single parse/validation error with optional location and snippet. */
export interface ParseError {
  line: number;
  column: number;
  message: string;
  /** Optional line or context snippet for display */
  snippet?: string;
}

/** Generic validation result: valid flag + list of errors + optional tool-specific stats. */
export interface ValidationResult<TStats = Record<string, unknown>> {
  valid: boolean;
  errors: ParseError[];
  stats?: TStats | null;
}

/**
 * Normalize a single error string (e.g. a DOMParser <parsererror> text) into one ParseError,
 * extracting the real line/column when the message embeds it so the editor highlights the right
 * line. Handles Blink/WebKit ("error on line 5 at column 12: …") and Firefox ("Line Number 5,
 * Column 12") wording; falls back to 1:1 when no location is present.
 */
export function singleErrorToParseErrors(error: string): ParseError[] {
  if (!error?.trim()) return [];
  const text = error.trim();

  const loc =
    text.match(/line\s+(\d+)\s+at\s+column\s+(\d+)/i) ?? // Blink/WebKit
    text.match(/line\s*number\s*(\d+),\s*column\s*(\d+)/i); // Firefox
  const line = loc ? Number(loc[1]) : 1;
  const column = loc ? Number(loc[2]) : 1;

  // Clean Blink's boilerplate wrapper and keep the concise "…: <message>" part when present.
  let message = text
    .replace(/^This page contains the following errors:\s*/i, "")
    .split(/\s*Below is a rendering/i)[0];
  const concise = message.match(/column\s+\d+:\s*([\s\S]+)/i);
  if (concise) message = concise[1];
  message = message.replace(/\s+/g, " ").trim();

  return [{ line, column, message: message || text, snippet: undefined }];
}
