/**
 * Core encoding/decoding utilities — pure functions.
 */

// ── Base64 ───────────────────────────────────────────────────────────

export const base64Encode = (s: string): string =>
  btoa(unescape(encodeURIComponent(s)));

export const base64Decode = (s: string): string =>
  decodeURIComponent(escape(atob(s)));

// ── JWT ──────────────────────────────────────────────────────────────

export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

export const decodeJwt = (token: string): JwtDecoded => {
  const parts = token.trim().split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format (expected 3 parts)");
  const fix = (s: string) => s.replace(/-/g, "+").replace(/_/g, "/");
  const header = JSON.parse(base64Decode(fix(parts[0])));
  const payload = JSON.parse(base64Decode(fix(parts[1])));
  return { header, payload };
};

// ── URL Encoding ─────────────────────────────────────────────────────

export const urlEncode = (s: string): string => encodeURIComponent(s);
export const urlDecode = (s: string): string => decodeURIComponent(s);

// ── HTML Entities ────────────────────────────────────────────────────

const htmlEntities: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
};

export const htmlEncode = (s: string): string =>
  s.replace(/[&<>"']/g, (c) => htmlEntities[c] || c);

export const htmlDecode = (s: string): string => {
  const el = typeof document !== "undefined" ? document.createElement("div") : null;
  if (!el) return s;
  el.innerHTML = s;
  return el.textContent || "";
};

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

/** Parse hex string to Uint8Array (allows spaces). */
export function hexToBytes(hex: string): Uint8Array {
  const s = hex.replace(/\s/g, "");
  if (!/^[0-9a-fA-F]*$/.test(s) || s.length % 2 !== 0) throw new Error("Invalid hex: expected even-length hex string");
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
}

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
