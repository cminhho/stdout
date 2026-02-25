/**
 * HTML formatter: validation, beautify, minify. Single place for HTML formatter logic.
 */

import type { IndentOption } from "@/components/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { htmlBeautify } from "@/utils/beautifier";
import { singleErrorToParseErrors } from "@/utils/validationTypes";
import { validateHtml } from "@/utils/validators";

export const HTML_FILE_ACCEPT = ".html,.htm,text/html";
export const HTML_OUTPUT_FILENAME = "output.html";
export const HTML_MIME_TYPE = "text/html";
export const HTML_LANGUAGE = "html";
export const HTML_INPUT_PLACEHOLDER = "<div>...</div>";
export const HTML_OUTPUT_PLACEHOLDER = "Result will appear here...";

export const HTML_FORMATTER_SAMPLE =
  `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Sample</title><link rel="stylesheet" href="styles.css"/></head><body><div class="container"><header><h1>Hello</h1></header><main><p>Edit this HTML and use Beautify or Minify.</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul></main><footer><p>&copy; Example</p></footer></div></body></html>`;

function minifyHtml(html: string): string {
  return html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
}

export interface HtmlFormatResult {
  output: string;
  errors?: ParseError[];
}

export function processHtmlInput(
  input: string,
  indent: IndentOption
): HtmlFormatResult | Promise<HtmlFormatResult> {
  const validation = validateHtml(input);
  const errors =
    validation.valid || !validation.error ? [] : singleErrorToParseErrors(validation.error);
  if (!input.trim()) return { output: "", errors };
  if (indent === "minified") return { output: minifyHtml(input), errors };
  const indentNum = indent === "tab" ? 2 : (indent as number);
  const useTabs = indent === "tab";
  return htmlBeautify(input, indentNum, useTabs)
    .then((output) => ({ output, errors }))
    .catch((err) => ({
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
      errors,
    }));
}
