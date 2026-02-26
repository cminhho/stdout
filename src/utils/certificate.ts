/**
 * PEM / X.509 certificate inspect. Single place for logic and constants.
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const CERTIFICATE_FILE_ACCEPT = ".pem,.crt,.cer,text/plain";
export const CERTIFICATE_SAMPLE = "-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAK...\n-----END CERTIFICATE-----";
export const CERTIFICATE_PLACEHOLDER_INPUT = "-----BEGIN CERTIFICATE-----\n...";
export const CERTIFICATE_PLACEHOLDER_OUTPUT = "Paste a PEM certificate and click Decode...";
export const CERTIFICATE_OUTPUT_FILENAME = "cert-info.json";
export const CERTIFICATE_MIME_TYPE = "application/json";

export interface CertificateFormatResult {
  output: string;
  errors?: import("@/utils/validationTypes").ParseError[];
}

export interface PemInfo {
  type: string;
  base64Length: number;
  byteLength: number;
  fingerprint: string;
  raw: string;
}

export function parsePem(pem: string): PemInfo {
  const lines = pem.trim().split("\n");
  const type = lines[0]?.match(/-----BEGIN (.+)-----/)?.[1] ?? "UNKNOWN";
  const body = lines.filter((l) => !l.startsWith("-----")).join("");
  const bytes = atob(body);
  const hex = Array.from(bytes, (c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(":");
  return {
    type,
    base64Length: body.length,
    byteLength: bytes.length,
    fingerprint: hex.slice(0, 59) + "...",
    raw: body,
  };
}

export function processCertificateForLayout(input: string, indent: IndentOption): CertificateFormatResult {
  if (!input.trim()) return { output: "" };
  try {
    const result = parsePem(input);
    const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
    const display = { ...result, raw: result.raw ? "(base64 omitted)" : undefined };
    const output = JSON.stringify(display, null, space);
    return { output };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}
