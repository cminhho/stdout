import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

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
  const [input, setInput] = useState("");

  const result = useMemo((): ValidationResult | null => {
    if (!input.trim()) return null;
    try {
      const parsed = JSON.parse(input);
      const stats = analyzeJson(parsed);
      return { valid: true, errors: [], stats };
    } catch (e: any) {
      const msg = e.message;
      return { valid: false, errors: [msg], stats: { keys: 0, depth: 0, arrays: 0, objects: 0, nulls: 0 } };
    }
  }, [input]);

  return (
    <ToolLayout title={tool?.label ?? "JSON Validator"} description={tool?.description ?? "Validate JSON structure and syntax"}>
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
