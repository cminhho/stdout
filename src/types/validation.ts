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
 * Normalize a single error string (e.g. from XML/HTML parser) into one ParseError.
 */
export function singleErrorToParseErrors(error: string): ParseError[] {
  if (!error?.trim()) return [];
  return [{ line: 1, column: 1, message: error.trim(), snippet: undefined }];
}
