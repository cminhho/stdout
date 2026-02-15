/**
 * Core encoding/decoding utilities — pure functions.
 */

// ── Base64 ───────────────────────────────────────────────────────────

export const base64Encode = (s: string): string =>
  btoa(unescape(encodeURIComponent(s)));

export const base64Decode = (s: string): string =>
  decodeURIComponent(escape(atob(s)));

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
