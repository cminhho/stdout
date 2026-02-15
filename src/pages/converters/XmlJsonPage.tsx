import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";
import { xmlToJson, jsonToXml } from "@/utils/xmlJson";

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

const XmlJsonPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [mode, setMode] = useState<"xml2json" | "json2xml">("xml2json");
  const [input, setInput] = useState("");

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

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "xml2json") {
        const obj = xmlToJson(input);
        return { output: JSON.stringify(obj, null, 2), error: "" };
      }
      const parsed = JSON.parse(input);
      return { output: jsonToXml(parsed, "root"), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  return (
    <ToolLayout title={tool?.label ?? "XML ↔ JSON"} description={tool?.description ?? "Convert between XML and JSON"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".xml,.json,application/xml,application/json" className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload file">
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Button size="sm" variant={mode === "xml2json" ? "default" : "outline"} onClick={() => setMode("xml2json")}>XML → JSON</Button>
            <Button size="sm" variant={mode === "json2xml" ? "default" : "outline"} onClick={() => setMode("json2xml")}>JSON → XML</Button>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label={mode === "xml2json" ? "XML" : "JSON"} text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language={mode === "xml2json" ? "xml" : "json"} placeholder={mode === "xml2json" ? "<root>...</root>" : "{}"} />
        </div>
        <div className="tool-panel">
          <PanelHeader label={mode === "xml2json" ? "JSON" : "XML"} text={output} />
          {error && <div className="text-sm text-destructive mb-2">{error}</div>}
          <CodeEditor value={output} readOnly language={mode === "xml2json" ? "json" : "xml"} placeholder="Result..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlJsonPage;
