import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

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
  const [input, setInput] = useState("");

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
