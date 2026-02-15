import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

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
  const [input, setInput] = useState('{\n  "page": 1,\n  "limit": 20,\n  "filter": "active",\n  "sort": "name"\n}');
  const [mode, setMode] = useState<"toQs" | "toJson">("toQs");

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
      <div className="tool-toolbar">
        <Button size="sm" variant={mode === "toQs" ? "default" : "outline"} onClick={() => setMode("toQs")}>
          JSON → Query String
        </Button>
        <Button size="sm" variant={mode === "toJson" ? "default" : "outline"} onClick={() => setMode("toJson")}>
          Query String → JSON
        </Button>
      </div>
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
