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

const jsonToYaml = (obj: unknown, indent = 0): string => {
  const pad = "  ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj.includes("'") || obj.includes('"')) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => {
      const val = jsonToYaml(item, indent + 1);
      if (typeof item === "object" && item !== null) {
        return `${pad}- ${val.trimStart()}`;
      }
      return `${pad}- ${val}`;
    }).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      const yamlVal = jsonToYaml(val, indent + 1);
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        return `${pad}${key}:\n${yamlVal}`;
      }
      if (Array.isArray(val)) {
        return `${pad}${key}:\n${yamlVal}`;
      }
      return `${pad}${key}: ${yamlVal}`;
    }).join("\n");
  }
  return String(obj);
};

const JsonYamlPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
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
      const parsed = JSON.parse(input);
      return { output: jsonToYaml(parsed), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input]);

  return (
    <ToolLayout title={tool?.label ?? "JSON ↔ YAML"} description={tool?.description ?? "Convert between JSON and YAML formats"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <OptionField label="Upload your JSON file">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="JSON Input" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="json" placeholder='{"key": "value"}' />
        </div>
        <div className="tool-panel">
          <PanelHeader label="YAML Output" text={output} />
          {error ? (
            <div className="code-block text-destructive flex-1">{error}</div>
          ) : (
            <CodeEditor value={output} readOnly language="yaml" placeholder="Result will appear here..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonYamlPage;
