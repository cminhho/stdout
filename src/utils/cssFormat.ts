/**
 * CSS formatter: beautify, minify. Single place for CSS formatter logic.
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import { cssBeautify } from "@/utils/beautifier";
import { cssMinify } from "@/utils/minify";

export const CSS_FILE_ACCEPT = ".css,text/css";
export const CSS_OUTPUT_FILENAME = "output.css";
export const CSS_MIME_TYPE = "text/css";
export const CSS_LANGUAGE = "css";
export const CSS_INPUT_PLACEHOLDER = "body { margin: 0; }";
export const CSS_OUTPUT_PLACEHOLDER = "Result will appear here...";

export const CSS_FORMATTER_SAMPLE = `body { margin: 0; padding: 0; font-family: sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { background: #333; color: #fff; padding: 10px 20px; }
.main { display: flex; gap: 1rem; }
.footer { margin-top: 2rem; text-align: center; }`;

export interface CssFormatResult {
  output: string;
  errors?: never;
}

export function processCssInput(
  input: string,
  indent: IndentOption
): Promise<CssFormatResult> {
  if (!input.trim()) return Promise.resolve({ output: "" });
  const run =
    indent === "minified"
      ? () => cssMinify(input)
      : () => cssBeautify(input, typeof indent === "number" ? indent : 2);
  return run()
    .then((output) => ({ output }))
    .catch((err) => ({
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
    }));
}
