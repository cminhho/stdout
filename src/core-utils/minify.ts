/**
 * Minify service: JS via Terser, CSS via simple regex (browser-safe).
 * cssnano is Node-only (fs/path), so we use a lightweight CSS minifier for the browser.
 * For format/beautify see beautifier.ts (Prettier).
 */

import { minify as terserMinify } from "terser";

/**
 * Minify JavaScript with Terser. Removes comments and collapses whitespace.
 * Mangle disabled for readability in internal tooling.
 */
export async function jsMinify(js: string): Promise<string> {
  const result = await terserMinify(js, {
    compress: { defaults: true },
    mangle: false,
    format: { comments: false },
  });
  return result.code ?? js;
}

/**
 * Minify CSS (browser-safe: remove comments, collapse whitespace).
 * Does not use cssnano so the app runs without Node APIs.
 */
export async function cssMinify(css: string): Promise<string> {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}
