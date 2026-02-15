import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";
type TextMode = "formatted" | "minified";

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

const formatXml = (xml: string, indent = 2): string => {
  const tab = " ".repeat(indent);
  let formatted = "";
  let level = 0;
  const nodes = xml.replace(/>\s*</g, ">\n<").split("\n");
  for (const node of nodes) {
    const trimmed = node.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("</")) { level = Math.max(0, level - 1); formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.startsWith("<?") || trimmed.startsWith("<!")) { formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.endsWith("/>")) { formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.match(/<[^/][^>]*>[^<]*<\/[^>]+>$/)) { formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.startsWith("<")) { formatted += tab.repeat(level) + trimmed + "\n"; level++; }
    else { formatted += tab.repeat(level) + trimmed + "\n"; }
  }
  return formatted.trimEnd();
};

const minifyXml = (xml: string): string =>
  xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const XmlFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>Advanced XML</title><author>Jane</author><price>39.99</price></book></catalog>');
  const [indent, setIndent] = useState(2);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [textMode, setTextMode] = useState<TextMode>("formatted");
  const [optionsOpen, setOptionsOpen] = useState(true);

  const output = useMemo(
    () => (textMode === "formatted" ? formatXml(input, indent) : minifyXml(input)),
    [input, indent, textMode]
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file, fileEncoding);
      setInput(text);
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  return (
    <ToolLayout title={tool?.label ?? "XML Formatter"} description={tool?.description ?? "Format and beautify XML documents"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml,application/xml,text/xml"
          className="hidden"
          onChange={handleFileUpload}
        />
        <OptionField label="Upload your XML file">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 px-2.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1.5" />
            Upload file
          </Button>
        </OptionField>
        <OptionField label="File encoding">
          <select
            value={fileEncoding}
            onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
            className={selectClass}
          >
            <option value="utf-8">UTF-8</option>
            <option value="utf-16le">UTF-16 LE</option>
            <option value="utf-16be">UTF-16 BE</option>
          </select>
        </OptionField>
        <OptionField label="Text mode">
          <select
            value={textMode}
            onChange={(e) => setTextMode(e.target.value as TextMode)}
            className={selectClass}
          >
            <option value="formatted">Formatted</option>
            <option value="minified">Minified</option>
          </select>
        </OptionField>
        <OptionField label="Indentation level">
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className={selectClass}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </OptionField>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input XML" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="xml" placeholder='<?xml version="1.0"?>...' />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="xml" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlFormatterPage;
