/**
 * Core encoding/decoding utilities — pure functions.
 */

import { singleErrorToParseErrors } from "@/utils/validationTypes";

// ── Base64 ───────────────────────────────────────────────────────────

export const base64Encode = (s: string): string =>
  btoa(unescape(encodeURIComponent(s)));

export const base64Decode = (s: string): string =>
  decodeURIComponent(escape(atob(s)));

export const BASE64_FILE_ACCEPT = ".txt,text/plain,application/octet-stream";
/** Sample for Encode mode (plain text). */
export const BASE64_SAMPLE = "Hello, Base64!";
/** Sample for Decode mode (base64 of BASE64_SAMPLE). */
export const BASE64_SAMPLE_DECODE = "SGVsbG8sIEJhc2U2NCE=";
export const BASE64_PLACEHOLDER_INPUT = "Enter text...";
export const BASE64_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const BASE64_OUTPUT_FILENAME = "output.txt";
export const BASE64_MIME_TYPE = "text/plain";

export type Base64Mode = "encode" | "decode";

export interface Base64FormatResult {
  output: string;
  errors?: import("@/utils/validationTypes").ParseError[];
}

export function processBase64ForLayout(input: string, mode: Base64Mode): Base64FormatResult {
  if (!input.trim()) return { output: "" };
  try {
    const output = mode === "encode" ? base64Encode(input) : base64Decode(input);
    return { output };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}

// ── File encoding (charset conversion) ─────────────────────────────────────
// TextDecoder labels: https://encoding.spec.whatwg.org/#names-and-labels

export const FILE_ENCODING_LABELS = [
  "utf-8",
  "iso-8859-1",
  "windows-1252",
  "windows-1251",
  "utf-16le",
  "utf-16be",
  "gbk",
  "gb18030",
  "big5",
  "euc-jp",
  "shift_jis",
  "euc-kr",
  "iso-8859-2",
  "iso-8859-15",
  "windows-1250",
] as const;

export type FileEncodingLabel = (typeof FILE_ENCODING_LABELS)[number];

/** Decode bytes with given encoding to string. */
export function decodeBytes(bytes: Uint8Array, encoding: string): string {
  return new TextDecoder(encoding).decode(bytes);
}

/** Encode string to UTF-8 bytes (browser TextEncoder is UTF-8 only). */
export function encodeToUtf8Bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

/** Bytes to hex string. */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
