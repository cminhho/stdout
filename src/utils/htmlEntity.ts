/**
 * HTML entity encode/decode. Single place for logic and constants.
 */

export const HTML_ENTITY_FILE_ACCEPT = ".html,.htm,text/html,text/plain";
export const HTML_ENTITY_SAMPLE = "<div>Hello &amp; World</div>";
export const HTML_ENTITY_PLACEHOLDER_INPUT = "<div>Hello</div>";
export const HTML_ENTITY_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const HTML_ENTITY_OUTPUT_FILENAME = "output.html";
export const HTML_ENTITY_MIME_TYPE = "text/html";

export type HtmlEntityMode = "encode" | "decode";

export interface HtmlEntityFormatResult {
  output: string;
}

export function htmlEncode(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function htmlDecode(s: string): string {
  const doc = new DOMParser().parseFromString(s, "text/html");
  return doc.documentElement.textContent ?? "";
}

export function processHtmlEntityForLayout(input: string, mode: HtmlEntityMode): HtmlEntityFormatResult {
  if (!input.trim()) return { output: "" };
  const output = mode === "encode" ? htmlEncode(input) : htmlDecode(input);
  return { output };
}
