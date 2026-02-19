import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
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

const SAMPLE_JSON = '{\n  "page": 1,\n  "limit": 20,\n  "filter": "active",\n  "sort": "name"\n}';
const SAMPLE_QS = "page=1&limit=20&filter=active&sort=name";

const JsonQueryStringPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(SAMPLE_JSON);
  const [mode, setMode] = useState<"toQs" | "toJson">("toQs");
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
        const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
        return { output: JSON.stringify(obj, null, space), error: "" };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, indent]);

  const inputLang = mode === "toQs" ? "json" as const : "text" as const;
  const outputLang = mode === "toQs" ? "text" as const : "json" as const;

  const sampleInput = mode === "toQs" ? SAMPLE_JSON : SAMPLE_QS;

  return (
    <ToolLayout title={tool?.label ?? "JSON ↔ Query String"} description={tool?.description ?? "Convert between JSON and URL query strings"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <Button size="sm" variant={mode === "toQs" ? "default" : "outline"} onClick={() => setMode("toQs")} className="h-7 text-xs">
          JSON → Query String
        </Button>
        <Button size="sm" variant={mode === "toJson" ? "default" : "outline"} onClick={() => setMode("toJson")} className="h-7 text-xs">
          Query String → JSON
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "toQs" ? "JSON Input" : "Query String Input"}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(sampleInput)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".json,application/json,text/plain" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language={inputLang} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Output"
            text={output}
            extra={mode === "toJson" ? <IndentSelect value={indent} onChange={setIndent} className={selectClass} /> : undefined}
          />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language={outputLang} placeholder="Result will appear here..." fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonQueryStringPage;
