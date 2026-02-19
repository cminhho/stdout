/**
 * Shared XML format/minify for use in XmlFormatterPage, XsdGeneratorPage, XsltTransformerPage.
 */

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
