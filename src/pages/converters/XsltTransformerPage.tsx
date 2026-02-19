import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

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
  const xmlInputRef = useRef<HTMLInputElement>(null);
  const xsltInputRef = useRef<HTMLInputElement>(null);
  const [xml, setXml] = useState(defaultXml);
  const [xslt, setXslt] = useState(defaultXslt);

  const handleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setXml(await readFileAsText(file));
    } catch {
      setXml("");
    }
    e.target.value = "";
  };

  const handleXsltUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setXslt(await readFileAsText(file));
    } catch {
      setXslt("");
    }
    e.target.value = "";
  };

  const { output, error } = useMemo(() => {
    if (!xml.trim() || !xslt.trim()) return { output: "", error: "" };
    try {
      return { output: transformWithXslt(xml, xslt), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [xml, xslt]);

  const inputExtra = (onSample: () => void, onClear: () => void, inputRef: React.RefObject<HTMLInputElement | null>, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, accept: string) => (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onSample}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={onClear}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => inputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "XSLT Transformer"} description={tool?.description ?? "Transform XML using XSLT stylesheet"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XML Input"
            extra={inputExtra(() => setXml(defaultXml), () => setXml(""), xmlInputRef, handleXmlUpload, ".xml,application/xml,text/xml")}
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={xml} onChange={setXml} language="xml" placeholder="XML document..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XSLT Stylesheet"
            extra={inputExtra(() => setXslt(defaultXslt), () => setXslt(""), xsltInputRef, handleXsltUpload, ".xsl,.xslt,application/xml,text/xml")}
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={xslt} onChange={setXslt} language="xml" placeholder="XSLT..." fillHeight />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col min-h-0 flex-1">
        {error && <div className="text-sm text-destructive mb-2 shrink-0">Error: {error}</div>}
        <div className="tool-panel flex flex-col min-h-0 flex-1">
          <PanelHeader label="Transformed Output" text={output} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsltTransformerPage;
