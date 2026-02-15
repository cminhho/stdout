import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

const transforms: Record<string, (s: string) => string> = {
  "camelCase": (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^[A-Z]/, (c) => c.toLowerCase()),
  "PascalCase": (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^[a-z]/, (c) => c.toUpperCase()),
  "snake_case": (s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase(),
  "SCREAMING_SNAKE": (s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toUpperCase(),
  "kebab-case": (s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase(),
  "dot.case": (s) => s.replace(/([a-z])([A-Z])/g, "$1.$2").replace(/[-_\s]+/g, ".").toLowerCase(),
  "Title Case": (s) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
  "UPPERCASE": (s) => s.toUpperCase(),
  "lowercase": (s) => s.toLowerCase(),
  "Reverse": (s) => s.split("").reverse().join(""),
  "Slug": (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  "Trim Lines": (s) => s.split("\n").map((l) => l.trim()).join("\n"),
  "Remove Empty Lines": (s) => s.split("\n").filter((l) => l.trim()).join("\n"),
  "Sort Lines (A-Z)": (s) => s.split("\n").sort().join("\n"),
  "Unique Lines": (s) => [...new Set(s.split("\n"))].join("\n"),
  "Escape Quotes": (s) => s.replace(/"/g, '\\"').replace(/'/g, "\\'"),
  "Unescape Quotes": (s) => s.replace(/\\"/g, '"').replace(/\\'/g, "'"),
};

const StringTransformerPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState("camelCase");

  const output = useMemo(() => {
    if (!input) return "";
    return transforms[selected]?.(input) ?? input;
  }, [input, selected]);

  const stats = useMemo(() => {
    if (!input) return null;
    const chars = input.length;
    const words = input.trim() ? input.trim().split(/\s+/).length : 0;
    const lines = input.split("\n").length;
    const bytes = new TextEncoder().encode(input).length;
    return { chars, words, lines, bytes };
  }, [input]);

  return (
    <ToolLayout title={tool?.label ?? "String Utilities"} description={tool?.description ?? "Convert between camelCase, snake_case, and more"}>
      {stats && (
        <div className="flex flex-wrap gap-2 text-xs mb-3">
          {Object.entries(stats).map(([label, value]) => (
            <span key={label} className="px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
              {label}: <span className="font-mono font-medium text-foreground">{value}</span>
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Object.keys(transforms).map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${selected === name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text to transform..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label={`Result (${selected})`} text={output} />
          <CodeEditor value={output} readOnly language="text" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default StringTransformerPage;
