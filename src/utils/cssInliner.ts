/**
 * CSS Inliner: inline CSS rules into HTML (e.g. for email). Single place for inliner logic.
 */

export const CSS_INLINER_HTML_SAMPLE = `<div class="container">
  <h1 class="title">Hello World</h1>
  <p class="text">This is a paragraph.</p>
</div>`;

export const CSS_INLINER_CSS_SAMPLE = `.container { padding: 20px; background-color: #f5f5f5; }
.title { color: #333; font-size: 24px; font-weight: bold; }
.text { color: #666; font-size: 14px; line-height: 1.6; }`;

export const CSS_INLINER_HTML_ACCEPT = ".html,.htm,text/html";
export const CSS_INLINER_CSS_ACCEPT = ".css,text/css";
export const CSS_INLINER_HTML_PLACEHOLDER = "<div class=\"container\">...</div>";
export const CSS_INLINER_CSS_PLACEHOLDER = ".class { prop: value; }";
export const CSS_INLINER_OUTPUT_FILENAME = "inlined.html";
export const CSS_INLINER_OUTPUT_MIME_TYPE = "text/html";

export function inlineCss(html: string, css: string): string {
  const rules: { selector: string; props: string }[] = [];
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(css)) !== null) {
    rules.push({ selector: match[1].trim(), props: match[2].trim() });
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  for (const rule of rules) {
    try {
      const els = doc.querySelectorAll(rule.selector);
      els.forEach((el) => {
        const existing = el.getAttribute("style") || "";
        el.setAttribute("style", existing ? `${existing}; ${rule.props}` : rule.props);
      });
    } catch {
      // Invalid selector, skip
    }
  }

  return doc.body.innerHTML;
}
