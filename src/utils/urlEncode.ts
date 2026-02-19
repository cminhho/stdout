/**
 * URL encode/decode. Single place for logic and constants.
 */

import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const URL_ENCODE_FILE_ACCEPT = ".txt,text/plain";
export const URL_ENCODE_SAMPLE = "Hello World & Co.";
export const URL_ENCODE_PLACEHOLDER_INPUT = "Enter text or URL...";
export const URL_ENCODE_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const URL_ENCODE_OUTPUT_FILENAME = "output.txt";
export const URL_ENCODE_MIME_TYPE = "text/plain";

export type UrlEncodeMode = "encode" | "decode";

export interface UrlEncodeFormatResult {
  output: string;
  errors?: import("@/utils/validationTypes").ParseError[];
}

export function processUrlEncodeForLayout(input: string, mode: UrlEncodeMode): UrlEncodeFormatResult {
  if (!input.trim()) return { output: "" };
  try {
    const output = mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    return { output };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}
