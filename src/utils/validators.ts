/**
 * XML/HTML validation and XPath evaluation (browser APIs).
 */

interface XmlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateXml(xmlString: string): XmlValidationResult {
  if (!xmlString.trim()) return { valid: true };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) {
      const msg = err.textContent || "Unknown parse error";
      return { valid: false, error: msg };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

interface HtmlValidationResult {
  valid: boolean;
  error?: string;
}

export function validateHtml(htmlString: string): HtmlValidationResult {
  if (!htmlString.trim()) return { valid: true };
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    const err = doc.querySelector("parsererror");
    if (err) {
      const msg = err.textContent || "Unknown parse error";
      return { valid: false, error: msg };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: (e as Error).message };
  }
}

interface XPathResultItem {
  type: string;
  value: string;
}

const ORDERED_NODE_SNAPSHOT_TYPE = 7;
const STRING_TYPE = 1;

export function evaluateXPath(xmlString: string, xpath: string): { error: string | null; items: XPathResultItem[] } {
  const items: XPathResultItem[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");
    const err = doc.querySelector("parsererror");
    if (err) return { error: err.textContent || "Invalid XML", items: [] };
    if (!xpath.trim()) return { error: null, items: [] };

    const result = doc.evaluate(xpath, doc, null, ORDERED_NODE_SNAPSHOT_TYPE, null);
    const len = result.snapshotLength ?? 0;
    if (len > 0) {
      for (let i = 0; i < len; i++) {
        const node = result.snapshotItem?.(i) ?? null;
        if (!node) continue;
        const type = node.nodeType === 1 ? "element" : node.nodeType === 2 ? "attribute" : node.nodeType === 3 ? "text" : "node";
        const value = node.nodeType === 1 ? (node as Element).outerHTML : node.nodeValue ?? "";
        items.push({ type, value: value.slice(0, 500) + (value.length > 500 ? "…" : "") });
      }
    } else {
      const strResult = doc.evaluate(xpath, doc, null, STRING_TYPE, null);
      const strVal = strResult.stringValue;
      if (strVal !== undefined && strVal !== "") {
        items.push({ type: "string", value: strVal });
      }
    }
    return { error: null, items };
  } catch (e) {
    return { error: (e as Error).message, items: [] };
  }
}
