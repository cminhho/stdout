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

const csvToJson = (csv: string, delimiter = ","): unknown[] => {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
};

const jsonToCsv = (json: unknown[]): string => {
  if (!Array.isArray(json) || json.length === 0) return "";
  const headers = [...new Set(json.flatMap((item) => Object.keys(item as Record<string, unknown>)))];
  const rows = json.map((item) => {
    const obj = item as Record<string, unknown>;
    return headers.map((h) => {
      const v = String(obj[h] ?? "");
      return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
};

const CsvJsonPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"csv2json" | "json2csv">("csv2json");

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
      if (mode === "csv2json") {
        return { output: JSON.stringify(csvToJson(input), null, 2), error: "" };
      } else {
        const parsed = JSON.parse(input);
        if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array");
        return { output: jsonToCsv(parsed), error: "" };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  const inputLang = mode === "csv2json" ? "text" as const : "json" as const;
  const outputLang = mode === "csv2json" ? "json" as const : "text" as const;

  return (
    <ToolLayout title={tool?.label ?? "CSV ↔ JSON"} description={tool?.description ?? "Convert between CSV and JSON formats"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={handleFileUpload} />
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
            <Button size="sm" variant={mode === "csv2json" ? "default" : "outline"} onClick={() => setMode("csv2json")}>
              CSV → JSON
            </Button>
            <Button size="sm" variant={mode === "json2csv" ? "default" : "outline"} onClick={() => setMode("json2csv")}>
              JSON → CSV
            </Button>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader
            label={mode === "csv2json" ? "CSV Input" : "JSON Input"}
            text={input}
            onClear={() => setInput("")}
          />
          <CodeEditor
            value={input}
            onChange={setInput}
            language={inputLang}
            placeholder={mode === "csv2json" ? "name,age,city\nAlice,30,NYC\nBob,25,LA" : '[{"name":"Alice","age":30}]'}
          />
        </div>
        <div className="tool-panel">
          <PanelHeader
            label={mode === "csv2json" ? "JSON Output" : "CSV Output"}
            text={output}
          />
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

export default CsvJsonPage;
