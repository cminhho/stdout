import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";
import { xmlToXsd } from "@/utils/xsdGenerator";

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

const sampleXml = `<?xml version="1.0"?>
<catalog>
  <book id="1">
    <title>Alpha</title>
    <year>2020</year>
  </book>
</catalog>`;

const XsdGeneratorPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState(sampleXml);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file, fileEncoding));
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const { out, err } = useMemo(() => {
    if (!input.trim()) return { out: "", err: "" };
    try {
      return { out: xmlToXsd(input), err: "" };
    } catch (e) {
      return { out: "", err: (e as Error).message };
    }
  }, [input]);

  const output = out;
  const error = err;

  return (
    <ToolLayout title={tool?.label ?? "XSD Generator"} description={tool?.description ?? "Generate minimal XSD schema from XML"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".xml,application/xml,text/xml" className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <OptionField label="Upload your XML file">
            <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileInputRef.current?.click()}>
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
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="XML Input" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="xml" placeholder="Paste XML..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="XSD Output" text={output} />
          <CodeEditor value={output} readOnly language="xml" placeholder="Click Generate..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsdGeneratorPage;
