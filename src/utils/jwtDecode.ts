/**
 * JWT decode/inspect. Single place for decode logic and constants.
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const JWT_DECODE_FILE_ACCEPT = ".txt,text/plain";
export const JWT_DECODE_SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
export const JWT_DECODE_PLACEHOLDER_INPUT = "eyJhbGciOiJIUzI1NiIs...";
export const JWT_DECODE_PLACEHOLDER_OUTPUT = "Paste a JWT token to auto-decode...";
export const JWT_DECODE_OUTPUT_FILENAME = "decoded.json";
export const JWT_DECODE_MIME_TYPE = "application/json";

export interface JwtDecodeFormatResult {
  output: string;
  errors?: import("@/utils/validationTypes").ParseError[];
}

function decodeBase64(s: string): string {
  return decodeURIComponent(escape(atob(s)));
}

function decodeJwtPayload(token: string): { header: unknown; payload: unknown } {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format (expected 3 parts)");
  const fix = (t: string) => t.replace(/-/g, "+").replace(/_/g, "/");
  const header = JSON.parse(decodeBase64(fix(parts[0])));
  const payload = JSON.parse(decodeBase64(fix(parts[1])));
  return { header, payload };
}

export function processJwtDecodeForLayout(input: string, indent: IndentOption): JwtDecodeFormatResult {
  if (!input.trim()) return { output: "" };
  try {
    const result = decodeJwtPayload(input);
    const space =
      indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
    const output = JSON.stringify(result, null, space);
    return { output };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}
