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

interface ValidationResult {
  valid: boolean;
  errors: string[];
  stats: { keys: number; depth: number; arrays: number; objects: number; nulls: number };
}

function analyzeJson(val: unknown, depth = 0): { keys: number; depth: number; arrays: number; objects: number; nulls: number } {
  const stats = { keys: 0, depth, arrays: 0, objects: 0, nulls: 0 };
  if (val === null) { stats.nulls = 1; return stats; }
  if (Array.isArray(val)) {
    stats.arrays = 1;
    for (const item of val) {
      const sub = analyzeJson(item, depth + 1);
      stats.keys += sub.keys; stats.depth = Math.max(stats.depth, sub.depth);
      stats.arrays += sub.arrays; stats.objects += sub.objects; stats.nulls += sub.nulls;
    }
  } else if (typeof val === "object") {
    stats.objects = 1;
    const entries = Object.entries(val as Record<string, unknown>);
    stats.keys = entries.length;
    for (const [, v] of entries) {
      const sub = analyzeJson(v, depth + 1);
      stats.keys += sub.keys; stats.depth = Math.max(stats.depth, sub.depth);
      stats.arrays += sub.arrays; stats.objects += sub.objects; stats.nulls += sub.nulls;
    }
  }
  return stats;
}

const JsonValidatorPage = () => {
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

  const result = useMemo((): ValidationResult | null => {
    if (!input.trim()) return null;
    try {
      const parsed = JSON.parse(input);
      const stats = analyzeJson(parsed);
      return { valid: true, errors: [], stats };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { valid: false, errors: [msg], stats: { keys: 0, depth: 0, arrays: 0, objects: 0, nulls: 0 } };
    }
  }, [input]);

  return (
    <ToolLayout title={tool?.label ?? "JSON Validator"} description={tool?.description ?? "Validate JSON structure and syntax"}>
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
      {/* Validation status bar on top */}
      {result && (
        <div className="mb-3">
          <div className={`tool-card ${result.valid ? "border-green-500/30" : "border-destructive/50"}`}>
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`text-sm font-medium ${result.valid ? "text-green-400" : "text-destructive"}`}>
                {result.valid ? "✓ Valid JSON" : "✗ Invalid JSON"}
              </div>
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-destructive font-mono">{err}</p>
              ))}
              {result.valid && (
                <div className="flex gap-4 ml-auto">
                  {[
                    ["Keys", result.stats.keys],
                    ["Depth", result.stats.depth],
                    ["Objects", result.stats.objects],
                    ["Arrays", result.stats.arrays],
                    ["Nulls", result.stats.nulls],
                  ].map(([label, val]) => (
                    <div key={label as string} className="text-center">
                      <span className="text-sm font-mono text-primary mr-1">{val as number}</span>
                      <span className="text-[10px] text-muted-foreground">{label as string}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="JSON Input" text={input} onClear={() => setInput("")} />
          <CodeEditor
            value={input}
            onChange={setInput}
            language="json"
            placeholder="Paste JSON here..."
          />
        </div>

        <div className="tool-panel">
          <PanelHeader label="Formatted Output" text={result?.valid ? JSON.stringify(JSON.parse(input), null, 2) : ""} />
          {result?.valid ? (
            <CodeEditor
              value={JSON.stringify(JSON.parse(input), null, 2)}
              readOnly
              language="json"
              placeholder=""
            />
          ) : (
            <CodeEditor value="" readOnly language="json" placeholder="Valid formatted JSON will appear here..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonValidatorPage;
