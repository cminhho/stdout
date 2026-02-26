/**
 * Infer a minimal XSD from XML (element names and attributes).
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";
import { formatXml, minifyXml } from "@/utils/xmlFormat";

export const XSD_GENERATOR_FILE_ACCEPT = ".xml,application/xml,text/xml";
export const XSD_GENERATOR_SAMPLE_XML = `<?xml version="1.0"?>
<catalog>
  <book id="1">
    <title>Alpha</title>
    <year>2020</year>
  </book>
</catalog>`;
export const XSD_GENERATOR_PLACEHOLDER_INPUT = "Paste XML...";
export const XSD_GENERATOR_PLACEHOLDER_OUTPUT = "Click Generate...";

interface ElemInfo {
  attrs: Set<string>;
  children: Map<string, ElemInfo>;
  hasText: boolean;
}

function collectFromElement(el: Element): ElemInfo {
  const attrs = new Set<string>();
  for (const a of el.attributes) attrs.add(a.localName);
  const children = new Map<string, ElemInfo>();
  let hasText = false;
  for (const c of el.childNodes) {
    if (c.nodeType === 3 && (c as Text).textContent?.trim()) hasText = true;
    if (c.nodeType === 1) {
      const name = (c as Element).localName;
      const childInfo = collectFromElement(c as Element);
      const existing = children.get(name);
      if (existing) {
        mergeElemInfo(existing, childInfo);
      } else {
        children.set(name, childInfo);
      }
    }
  }
  return { attrs, children, hasText };
}

function mergeElemInfo(a: ElemInfo, b: ElemInfo): void {
  b.attrs.forEach((x) => a.attrs.add(x));
  b.children.forEach((info, name) => {
    const existing = a.children.get(name);
    if (existing) mergeElemInfo(existing, info);
    else a.children.set(name, info);
  });
  if (b.hasText) a.hasText = true;
}

function elemToXsd(name: string, info: ElemInfo, indent: string): string {
  const next = indent + "  ";
  let s = `${indent}<xs:element name="${name}">\n`;
  s += `${next}<xs:complexType>\n`;
  if (info.children.size > 0 || info.hasText) {
    s += `${next}  <xs:sequence>\n`;
    for (const [childName, childInfo] of info.children) {
      s += elemToXsd(childName, childInfo, next + "    ");
    }
    if (info.hasText) s += `${next}    <xs:element name="__text" type="xs:string" minOccurs="0"/>\n`;
    s += `${next}  </xs:sequence>\n`;
  }
  for (const a of info.attrs) {
    s += `${next}  <xs:attribute name="${a}" type="xs:string" use="optional"/>\n`;
  }
  s += `${next}</xs:complexType>\n`;
  s += `${indent}</xs:element>\n`;
  return s;
}

export function xmlToXsd(xmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "application/xml");
  const err = doc.querySelector("parsererror");
  if (err) throw new Error(err.textContent || "Invalid XML");
  const root = doc.documentElement;
  const name = root.localName;
  const info = collectFromElement(root);
  let xsd = `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" elementFormDefault="qualified">
  <xs:element name="${name}">
    <xs:complexType>
      <xs:sequence>
`;
  for (const [childName, childInfo] of info.children) {
    xsd += elemToXsd(childName, childInfo, "        ");
  }
  xsd += `      </xs:sequence>
`;
  for (const a of info.attrs) {
    xsd += `      <xs:attribute name="${a}" type="xs:string" use="optional"/>\n`;
  }
  xsd += `    </xs:complexType>
  </xs:element>
</xs:schema>`;
  return xsd;
}

export const XSD_GENERATOR_OUTPUT_FILENAME = "schema.xsd";
export const XSD_GENERATOR_MIME_TYPE = "application/xml";

export interface XsdGeneratorFormatResult {
  output: string;
  errors?: ParseError[];
}

export function processXmlToXsd(input: string, indent: IndentOption): XsdGeneratorFormatResult {
  if (!input.trim()) return { output: "", errors: [] };
  try {
    const raw = xmlToXsd(input);
    const output =
      indent === "minified"
        ? minifyXml(raw)
        : formatXml(raw, indent === "tab" ? 2 : (indent as number), indent === "tab");
    return { output, errors: [] };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}
