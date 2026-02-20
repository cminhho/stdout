/**
 * Shared XML format/minify for use in XmlFormatterPage, XsdGeneratorPage, XsltTransformerPage.
 */

import type { IndentOption } from "@/components/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";
import { validateXml } from "@/utils/validators";

export const XML_FILE_ACCEPT = ".xml,application/xml,text/xml";
export const XML_OUTPUT_FILENAME = "output.xml";
export const XML_MIME_TYPE = "application/xml";
export const XML_LANGUAGE = "xml";
export const XML_INPUT_PLACEHOLDER = "<?xml version=\"1.0\"?>...";
export const XML_OUTPUT_PLACEHOLDER = "Result will appear here...";

export const XML_FORMATTER_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Guide</title>
    <author>John Doe</author>
    <price>29.99</price>
  </book>
  <book id="2">
    <title>Advanced XML</title>
    <author>Jane Smith</author>
    <price>39.99</price>
  </book>
</catalog>`;

export interface XmlFormatResult {
  output: string;
  errors: ParseError[];
}

export function processXmlInput(input: string, indent: IndentOption): XmlFormatResult {
  const validation = validateXml(input);
  const errors =
    validation.valid || !validation.error ? [] : singleErrorToParseErrors(validation.error);
  const output = !input.trim()
    ? ""
    : indent === "minified"
      ? minifyXml(input)
      : formatXml(input, indent === "tab" ? 2 : (indent as number), indent === "tab");
  return { output, errors };
}

export function formatXml(xml: string, indent = 2, useTabs = false): string {
  const indentStr = useTabs ? "\t" : " ".repeat(indent);
  let formatted = "";
  let level = 0;
  const nodes = xml.replace(/>\s*</g, ">\n<").split("\n");
  for (const node of nodes) {
    const trimmed = node.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("</")) {
      level = Math.max(0, level - 1);
      formatted += indentStr.repeat(level) + trimmed + "\n";
    } else if (trimmed.startsWith("<?") || trimmed.startsWith("<!")) {
      formatted += indentStr.repeat(level) + trimmed + "\n";
    } else if (trimmed.endsWith("/>")) {
      formatted += indentStr.repeat(level) + trimmed + "\n";
    } else if (trimmed.match(/<[^/][^>]*>[^<]*<\/[^>]+>$/)) {
      formatted += indentStr.repeat(level) + trimmed + "\n";
    } else if (trimmed.startsWith("<")) {
      formatted += indentStr.repeat(level) + trimmed + "\n";
      level++;
    } else {
      formatted += indentStr.repeat(level) + trimmed + "\n";
    }
  }
  return formatted.trimEnd();
}

export function minifyXml(xml: string): string {
  return xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();
}
