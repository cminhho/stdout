import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

const defaultXml = "<books><book><title>Alpha</title><year>2020</year></book></books>";
const defaultXslt = '<?xml version="1.0"?><xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0"><xsl:output method="text"/><xsl:template match="/"><xsl:for-each select="books/book">- <xsl:value-of select="title"/> (<xsl:value-of select="year"/>) </xsl:for-each></xsl:template></xsl:stylesheet>';

function transformWithXslt(xmlString: string, xsltString: string): string {
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

const XsltTransformerPage = () => {
  const tool = useCurrentTool();
  const [xml, setXml] = useState(defaultXml);
  const [xslt, setXslt] = useState(defaultXslt);

  const { output, error } = useMemo(() => {
    if (!xml.trim() || !xslt.trim()) return { output: "", error: "" };
    try {
      return { output: transformWithXslt(xml, xslt), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [xml, xslt]);

  return (
    <ToolLayout title={tool?.label ?? "XSLT Transformer"} description={tool?.description ?? "Transform XML using XSLT stylesheet"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="XML Input" text={xml} onClear={() => setXml("")} />
          <CodeEditor value={xml} onChange={setXml} language="xml" placeholder="XML document..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="XSLT Stylesheet" text={xslt} onClear={() => setXslt("")} />
          <CodeEditor value={xslt} onChange={setXslt} language="xml" placeholder="XSLT..." />
        </div>
      </div>
      <div className="mt-4">
        {error && <div className="text-sm text-destructive mb-2">Error: {error}</div>}
        <div className="tool-panel">
          <PanelHeader label="Transformed Output" text={output} />
          <CodeEditor value={output} readOnly language="xml" placeholder="Result..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsltTransformerPage;
