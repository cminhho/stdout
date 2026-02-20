/**
 * XSLT Transformer: transform XML with XSLT. Single place for defaults and transform logic.
 */

export const XSLT_XML_FILE_ACCEPT = ".xml,application/xml,text/xml";
export const XSLT_XSLT_FILE_ACCEPT = ".xsl,.xslt,application/xml,text/xml";

export const XSLT_DEFAULT_XML = "<books><book><title>Alpha</title><year>2020</year></book></books>";
export const XSLT_DEFAULT_XSLT =
  '<?xml version="1.0"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="text"/><xsl:template match="/"><xsl:for-each select="books/book">- <xsl:value-of select="title"/> (<xsl:value-of select="year"/>) </xsl:for-each></xsl:template></xsl:stylesheet>';

export const XSLT_PLACEHOLDER_XML = "XML document...";
export const XSLT_PLACEHOLDER_XSLT = "XSLT...";
export const XSLT_PLACEHOLDER_OUTPUT = "Result...";

export function transformWithXslt(xmlString: string, xsltString: string): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");
  const xsltDoc = parser.parseFromString(xsltString, "application/xml");
  const err = xmlDoc.querySelector("parsererror") || xsltDoc.querySelector("parsererror");
  if (err) throw new Error(err.textContent || "Invalid XML or XSLT");
  const processor = new XSLTProcessor();
  processor.importStylesheet(xsltDoc);
  const result = processor.transformToDocument(xmlDoc);
  const serializer = new XMLSerializer();
  return serializer.serializeToString(result);
}
