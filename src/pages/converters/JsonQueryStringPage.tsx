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

const flatten = (obj: unknown, prefix = ""): [string, string][] => {
  const pairs: [string, string][] = [];
  if (typeof obj !== "object" || obj === null) {
    pairs.push([prefix, String(obj)]);
    return pairs;
  }
  if (Array.isArray(obj)) {
    obj.forEach((v, i) => pairs.push(...flatten(v, `${prefix}[${i}]`)));
    return pairs;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}[${k}]` : k;
    pairs.push(...flatten(v, key));
  }
  return pairs;
};

const JsonQueryStringPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState('{\n  "page": 1,\n  "limit": 20,\n  "filter": "active",\n  "sort": "name"\n}');
  const [mode, setMode] = useState<"toQs" | "toJson">("toQs");

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
      if (mode === "toQs") {
        const parsed = JSON.parse(input);
        const pairs = flatten(parsed);
        return { output: pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&"), error: "" };
      } else {
        const params = new URLSearchParams(input.trim());
        const obj: Record<string, string> = {};
        params.forEach((v, k) => { obj[k] = v; });
        return { output: JSON.stringify(obj, null, 2), error: "" };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  const inputLang = mode === "toQs" ? "json" as const : "text" as const;
  const outputLang = mode === "toQs" ? "text" as const : "json" as const;

  return (
    <ToolLayout title={tool?.label ?? "JSON ↔ Query String"} description={tool?.description ?? "Convert between JSON and URL query strings"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".json,application/json,text/plain" className="hidden" onChange={handleFileUpload} />
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
            <Button size="sm" variant={mode === "toQs" ? "default" : "outline"} onClick={() => setMode("toQs")}>
              JSON → Query String
            </Button>
            <Button size="sm" variant={mode === "toJson" ? "default" : "outline"} onClick={() => setMode("toJson")}>
              Query String → JSON
            </Button>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader
            label={mode === "toQs" ? "JSON Input" : "Query String Input"}
            text={input}
            onClear={() => setInput("")}
          />
          <CodeEditor value={input} onChange={setInput} language={inputLang} />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          {error ? (
            <div className="code-block text-destructive flex-1">{error}</div>
          ) : (
            <CodeEditor value={output} readOnly language={outputLang} placeholder="Result will appear here..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonQueryStringPage;
