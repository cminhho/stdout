/**
 * Gzip compress/decompress. Single place for logic and constants.
 */

import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const GZIP_FILE_ACCEPT = ".txt,text/plain";
/** Sample for Compress mode (plain text). */
export const GZIP_SAMPLE = "Text to compress with gzip";
/** Sample for Decompress mode (base64 of gzip-compressed GZIP_SAMPLE). */
export const GZIP_SAMPLE_DECODE =
  "H4sIAAAAAAAAEwtJrShRKMlXSM7PLShKLS5WKM8syVBIr8osAAC4qn+aGgAAAA==";
export const GZIP_PLACEHOLDER_INPUT = "Enter text to compress...";
export const GZIP_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const GZIP_OUTPUT_FILENAME = "output.txt";
export const GZIP_MIME_TYPE = "text/plain";

export type GzipMode = "compress" | "decompress";

export interface GzipFormatResult {
  output: string;
  errors?: import("@/utils/validationTypes").ParseError[];
}

async function compress(text: string): Promise<string> {
  const blob = new Blob([text]);
  const cs = new CompressionStream("gzip");
  const stream = blob.stream().pipeThrough(cs);
  const compressed = await new Response(stream).arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

async function decompress(b64: string): Promise<string> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ds = new DecompressionStream("gzip");
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Response(stream).text();
}

export async function processGzipForLayout(input: string, mode: GzipMode): Promise<GzipFormatResult> {
  if (!input.trim()) return { output: "" };
  try {
    const output = mode === "compress" ? await compress(input) : await decompress(input);
    return { output };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}
