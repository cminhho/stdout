import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import { xmlToXsd } from "@/utils/xsdGenerator";
import { formatXml, minifyXml } from "@/utils/xmlFormat";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";

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
  const [input, setInput] = useState(sampleXml);
  const [indent, setIndent] = useState<IndentOption>(2);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file));
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const { out, err } = useMemo(() => {
    if (!input.trim()) return { out: "", err: "" };
    try {
      const raw = xmlToXsd(input);
      if (indent === "minified") return { out: minifyXml(raw), err: "" };
      const indentNum = indent === "tab" ? 2 : (indent as number);
      const useTabs = indent === "tab";
      return { out: formatXml(raw, indentNum, useTabs), err: "" };
    } catch (e) {
      return { out: "", err: (e as Error).message };
    }
  }, [input, indent]);

  const output = out;
  const error = err;

  return (
    <ToolLayout title={tool?.label ?? "XSD Generator"} description={tool?.description ?? "Generate minimal XSD schema from XML"}>
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XML Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(sampleXml)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".xml,application/xml,text/xml" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="xml" placeholder="Paste XML..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="XSD Output" text={output} extra={<IndentSelect value={indent} onChange={setIndent} className={selectClass} />} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder="Click Generate..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsdGeneratorPage;
