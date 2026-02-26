/**
 * JavaScript formatter: beautify, minify. Single place for JS formatter logic.
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import { jsBeautify } from "@/utils/beautifier";
import { jsMinify } from "@/utils/minify";

export const JS_FILE_ACCEPT = ".js,.mjs,.cjs,text/javascript";
export const JS_OUTPUT_FILENAME = "output.js";
export const JS_MIME_TYPE = "text/javascript";
export const JS_LANGUAGE = "javascript";
export const JS_INPUT_PLACEHOLDER = "Paste JavaScript...";
export const JS_OUTPUT_PLACEHOLDER = "Result...";

export const JS_FORMATTER_SAMPLE = `function greet(name) {
  return "Hello, " + name + "!";
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

users.forEach((u) => {
  console.log(greet(u.name));
});

export { greet, users };
`;

export interface JsFormatResult {
  output: string;
  errors?: never;
}

export function processJsInput(
  input: string,
  indent: IndentOption
): Promise<JsFormatResult> {
  if (!input.trim()) return Promise.resolve({ output: "" });
  if (indent === "minified") {
    return jsMinify(input)
      .then((output) => ({ output }))
      .catch((err) => ({
        output: `Error: ${err instanceof Error ? err.message : String(err)}`,
      }));
  }
  const indentNum = indent === "tab" ? 2 : (indent as number);
  const useTabs = indent === "tab";
  return jsBeautify(input, indentNum, useTabs)
    .then((output) => ({ output }))
    .catch((err) => ({
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
    }));
}
