/**
 * XML to JSON and JSON to XML (attributes in @, text in #text).
 */

import type { IndentOption } from "@/components/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const XML_JSON_FILE_ACCEPT = ".xml,.json,application/xml,application/json";
export const XML_JSON_SAMPLE_XML = '<root><item id="1">Alpha</item><item id="2">Beta</item></root>';
export const XML_JSON_SAMPLE_JSON = '{"root":{"item":[{"@id":"1","#text":"Alpha"},{"@id":"2","#text":"Beta"}]}}';
export const XML_JSON_PLACEHOLDER_XML = "<root>...</root>";
export const XML_JSON_PLACEHOLDER_JSON = "{}";
export const XML_JSON_PLACEHOLDER_OUTPUT = "Result...";
export const XML_JSON_OUTPUT_FILENAME_JSON = "output.json";
export const XML_JSON_OUTPUT_FILENAME_XML = "output.xml";
export const XML_JSON_MIME_JSON = "application/json";
export const XML_JSON_MIME_XML = "application/xml";

export type XmlJsonMode = "xml2json" | "json2xml";

export interface XmlJsonFormatResult {
  output: string;
  errors?: ParseError[];
}

export function processXmlJson(input: string, indent: IndentOption, mode: XmlJsonMode): XmlJsonFormatResult {
  if (!input.trim()) return { output: "", errors: [] };
  try {
    if (mode === "xml2json") {
      const obj = xmlToJson(input);
      const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
      return { output: JSON.stringify(obj, null, space), errors: [] };
    }
    const parsed = JSON.parse(input) as object;
    return { output: jsonToXml(parsed, "root"), errors: [] };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}

function domToObj(node: Node): unknown {
  if (node.nodeType === 3) {
    const t = (node as Text).textContent;
    return t ? t.trim() : null;
  }
  if (node.nodeType !== 1) return null;
  const el = node as Element;
  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    attrs[a.name] = a.value;
  }
  const children: Record<string, unknown[]> = {};
  let text = "";
  for (let i = 0; i < el.childNodes.length; i++) {
    const c = el.childNodes[i];
    if (c.nodeType === 3) text += (c as Text).textContent || "";
    else if (c.nodeType === 1) {
      const name = (c as Element).localName;
      if (!children[name]) children[name] = [];
      const val = domToObj(c);
      if (val !== null && val !== "") children[name].push(val);
    }
  }
  text = text.trim();
  const keys = Object.keys(children);
  if (keys.length === 0 && !text) return Object.keys(attrs).length ? { "@": attrs } : null;
  const out: Record<string, unknown> = {};
  if (Object.keys(attrs).length) out["@"] = attrs;
  for (const k of keys) out[k] = children[k].length === 1 ? children[k][0] : children[k];
  if (text) out["#text"] = text;
  return out;
}

export function xmlToJson(xmlString: string): object {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent || "Invalid XML");
  const root = doc.documentElement;
  const name = root.localName;
  const val = domToObj(root);
  return { [name]: val };
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function objToXml(name: string, val: unknown): string {
  if (val === null || val === undefined) return "";
  if (typeof val === "string" || typeof val === "number" || typeof val === "boolean") {
    return "<" + name + ">" + escapeXml(String(val)) + "</" + name + ">";
  }
  if (Array.isArray(val)) {
    return val.map(function (item) { return objToXml(name, item); }).join("");
  }
  if (typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const attrs = obj["@"] as Record<string, string> | undefined;
    let attrStr = "";
    if (attrs && typeof attrs === "object") {
      attrStr = " " + Object.entries(attrs).map(function (e) { return e[0] + '="' + escapeXml(String(e[1])) + '"'; }).join(" ");
    }
    const text = obj["#text"];
    const rest: Record<string, unknown> = {};
    for (const k of Object.keys(obj)) {
      if (k !== "@" && k !== "#text") rest[k] = obj[k];
    }
    const childKeys = Object.keys(rest).filter(function (k) {
      const v = rest[k];
      return v !== null && v !== undefined && v !== "";
    });
    if (childKeys.length === 0 && (text === undefined || text === "")) {
      return "<" + name + attrStr + "/>";
    }
    let inner = childKeys.map(function (k) { return objToXml(k, rest[k]); }).join("");
    if (text !== undefined && text !== "") inner += escapeXml(String(text));
    return "<" + name + attrStr + ">" + inner + "</" + name + ">";
  }
  return "";
}

export function jsonToXml(json: object, rootName: string): string {
  rootName = rootName || "root";
  const entries = Object.entries(json);
  if (entries.length === 0) return '<?xml version="1.0" encoding="UTF-8"?>\n<' + rootName + "/>";
  if (entries.length === 1) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + objToXml(entries[0][0], entries[0][1]);
  }
  let inner = "";
  for (let i = 0; i < entries.length; i++) inner += objToXml(entries[i][0], entries[i][1]);
  return '<?xml version="1.0" encoding="UTF-8"?>\n<' + rootName + ">" + inner + "</" + rootName + ">";
}
