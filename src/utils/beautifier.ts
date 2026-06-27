/**
 * Format service: JS, CSS, HTML via Prettier (community standard).
 * For minification see minify.ts (Terser / simple CSS).
 *
 * Prettier (+ plugins) is ~270 KB gzipped, so it's loaded on demand (first format call)
 * via dynamic import and cached — it's no longer pulled into the formatter page chunks.
 */

type PrettierBundle = {
  format: (source: string, options: Record<string, unknown>) => Promise<string>;
  babel: unknown;
  estree: unknown;
  postcss: unknown;
  html: unknown;
};

let prettierBundle: Promise<PrettierBundle> | null = null;

/**
 * Dynamic import interop differs by bundler/runtime: the real module object may be the namespace
 * itself or live under `.default` (CJS interop). Pick whichever actually carries the marker keys,
 * so a wrong shape never leaves a plugin `undefined` (Prettier then throws "reading 'languages'").
 */
function pickByKeys<T>(mod: unknown, keys: string[]): T {
  const m = mod as Record<string, unknown> | undefined;
  if (m && keys.some((k) => k in m)) return m as T;
  const d = m?.default as Record<string, unknown> | undefined;
  if (d && keys.some((k) => k in d)) return d as T;
  return (d ?? m) as T;
}

function loadPrettier(): Promise<PrettierBundle> {
  if (!prettierBundle) {
    prettierBundle = (async () => {
      const [prettier, babel, estree, postcss, html] = await Promise.all([
        import("prettier/standalone.js"),
        import("prettier/plugins/babel.js"),
        import("prettier/plugins/estree.js"),
        import("prettier/plugins/postcss.js"),
        import("prettier/plugins/html.js"),
      ]);
      const api = pickByKeys<{ format: PrettierBundle["format"] }>(prettier, ["format"]);
      const pluginKeys = ["parsers", "printers", "languages"];
      return {
        format: api.format,
        babel: pickByKeys(babel, pluginKeys),
        estree: pickByKeys(estree, pluginKeys),
        postcss: pickByKeys(postcss, pluginKeys),
        html: pickByKeys(html, pluginKeys),
      };
    })();
  }
  return prettierBundle;
}

/**
 * Format JavaScript with Prettier. Uses tabWidth for indent, or useTabs for tab character.
 * Standalone bundle requires both babel (parser) and estree (AST format) plugins.
 * @throws on parse error (caller should catch and show message).
 */
export async function jsBeautify(js: string, indentSize = 2, useTabs = false): Promise<string> {
  const p = await loadPrettier();
  return p.format(js, {
    parser: "babel",
    plugins: [p.babel, p.estree],
    tabWidth: indentSize,
    useTabs,
  });
}

/**
 * Format CSS with Prettier. Uses tabWidth for indent.
 * @throws on parse error (caller should catch and show message).
 */
export async function cssBeautify(css: string, indentSize = 2): Promise<string> {
  const p = await loadPrettier();
  return p.format(css, {
    parser: "css",
    plugins: [p.postcss],
    tabWidth: indentSize,
  });
}

/**
 * Format HTML with Prettier. Uses tabWidth for indent, or useTabs for tab character.
 * @throws on parse error (caller should catch and show message).
 */
export async function htmlBeautify(html: string, indentSize = 2, useTabs = false): Promise<string> {
  const p = await loadPrettier();
  return p.format(html, {
    parser: "html",
    plugins: [p.html],
    tabWidth: indentSize,
    useTabs,
  });
}
