import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const readFileAsText = (file: File, encoding: FileEncoding): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      if (result instanceof ArrayBuffer) {
        const enc = encoding === "utf-16le" ? "utf-16le" : encoding === "utf-16be" ? "utf-16be" : "utf-8";
        resolve(new TextDecoder(enc).decode(result));
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    if (encoding === "utf-8") {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
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
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [xml, setXml] = useState(defaultXml);
  const [xslt, setXslt] = useState(defaultXslt);

  const handleXmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setXml(await readFileAsText(file, fileEncoding));
    } catch {
      setXml("");
    }
    e.target.value = "";
  };

  const handleXsltUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setXslt(await readFileAsText(file, fileEncoding));
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

  return (
    <ToolLayout title={tool?.label ?? "XSLT Transformer"} description={tool?.description ?? "Transform XML using XSLT stylesheet"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={xmlInputRef} type="file" accept=".xml,application/xml,text/xml" className="hidden" onChange={handleXmlUpload} />
        <input ref={xsltInputRef} type="file" accept=".xsl,.xslt,application/xml,text/xml" className="hidden" onChange={handleXsltUpload} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <OptionField label="Upload XML file">
            <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => xmlInputRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1.5" />
              Upload file
            </Button>
          </OptionField>
          <OptionField label="Upload XSLT file">
            <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => xsltInputRef.current?.click()}>
              <Upload className="h-3 w-3 mr-1.5" />
              Upload file
            </Button>
          </OptionField>
          <OptionField label="File encoding">
            <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass}>
              <option value="utf-8">UTF-8</option>
              <option value="utf-16le">UTF-16 LE</option>
              <option value="utf-16be">UTF-16 BE</option>
            </select>
          </OptionField>
        </div>
      </ToolOptions>
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
