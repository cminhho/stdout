/**
 * Format service: JS, CSS, HTML via Prettier (community standard).
 * For minification see minify.ts (Terser / simple CSS).
 */

import * as prettier from "prettier/standalone";
import babelPlugin from "prettier/plugins/babel";
import estreePlugin from "prettier/plugins/estree";
import postcssPlugin from "prettier/plugins/postcss";
import htmlPlugin from "prettier/plugins/html";

/**
 * Format JavaScript with Prettier. Uses tabWidth for indent.
 * Standalone bundle requires both babel (parser) and estree (AST format) plugins.
 * @throws on parse error (caller should catch and show message).
 */
export async function jsBeautify(js: string, indentSize = 2): Promise<string> {
  return prettier.format(js, {
    parser: "babel",
    plugins: [babelPlugin, estreePlugin],
    tabWidth: indentSize,
  });
}

/**
 * Format CSS with Prettier. Uses tabWidth for indent.
 * @throws on parse error (caller should catch and show message).
 */
export async function cssBeautify(css: string, indentSize = 2): Promise<string> {
  return prettier.format(css, {
    parser: "css",
    plugins: [postcssPlugin],
    tabWidth: indentSize,
  });
}

/**
 * Format HTML with Prettier. Uses tabWidth for indent.
 * @throws on parse error (caller should catch and show message).
 */
export async function htmlBeautify(html: string, indentSize = 2): Promise<string> {
  return prettier.format(html, {
    parser: "html",
    plugins: [htmlPlugin],
    tabWidth: indentSize,
  });
}
