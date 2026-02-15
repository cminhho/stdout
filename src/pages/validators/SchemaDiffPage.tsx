import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";

interface DiffEntry {
  path: string;
  type: "added" | "removed" | "changed";
  oldValue?: string;
  newValue?: string;
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function diffObjects(a: unknown, b: unknown, path = ""): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const typeA = getType(a);
  const typeB = getType(b);
  if (typeA !== typeB) {
    entries.push({ path: path || "(root)", type: "changed", oldValue: typeA, newValue: typeB });
    return entries;
  }
  if (typeA === "object" && a !== null && b !== null) {
    const oa = a as Record<string, unknown>, ob = b as Record<string, unknown>;
    const keysA = new Set(Object.keys(oa));
    const keysB = new Set(Object.keys(ob));
    for (const key of keysB) {
      if (!keysA.has(key)) entries.push({ path: path ? `${path}.${key}` : key, type: "added", newValue: getType(ob[key]) });
    }
    for (const key of keysA) {
      if (!keysB.has(key)) entries.push({ path: path ? `${path}.${key}` : key, type: "removed", oldValue: getType(oa[key]) });
    }
    for (const key of keysA) {
      if (keysB.has(key)) entries.push(...diffObjects(oa[key], ob[key], path ? `${path}.${key}` : key));
    }
  } else if (typeA === "array" && Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) entries.push({ path: p, type: "added", newValue: getType(b[i]) });
      else if (i >= b.length) entries.push({ path: p, type: "removed", oldValue: getType(a[i]) });
      else entries.push(...diffObjects(a[i], b[i], p));
    }
  }
  return entries;
}

const SchemaDiffPage = () => {
  const tool = useCurrentTool();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const result = useMemo(() => {
    if (!left.trim() || !right.trim()) return null;
    try {
      return { diff: diffObjects(JSON.parse(left), JSON.parse(right)), error: null };
    } catch (e: unknown) {
      return { diff: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [left, right]);

  const diffText = result?.diff.map((d) =>
    `${d.type === "added" ? "+" : d.type === "removed" ? "-" : "~"} ${d.path}${d.type === "changed" ? ` (${d.oldValue} → ${d.newValue})` : d.type === "added" ? ` (${d.newValue})` : ` (${d.oldValue})`}`
  ).join("\n") ?? "";

  return (
    <ToolLayout title={tool?.label ?? "Schema Diff"} description={tool?.description ?? "Compare two JSON schemas side by side"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Schema A (JSON)" text={left} onClear={() => setLeft("")} />
          <CodeEditor value={left} onChange={setLeft} language="json" placeholder='{"id": 1, "name": "test"}' />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Schema B (JSON)" text={right} onClear={() => setRight("")} />
          <CodeEditor value={right} onChange={setRight} language="json" placeholder='{"id": "1", "email": "x@y.z"}' />
        </div>
      </div>

      {result?.error && <div className="tool-card border-destructive/50 text-destructive text-sm mt-4">⚠ {result.error}</div>}

      {result && !result.error && (
        <div className="tool-card mt-4">
          {result.diff.length === 0 ? (
            <p className="text-sm text-muted-foreground">✓ Schemas are identical</p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{result.diff.length} difference{result.diff.length !== 1 ? "s" : ""}</p>
                <CopyButton text={diffText} />
              </div>
              {result.diff.map((d, i) => (
                <div key={i} className={`text-xs font-mono ${d.type === "added" ? "text-primary" : d.type === "removed" ? "text-destructive" : "text-accent-foreground"}`}>
                  <span className="inline-block w-24">{d.type === "added" ? "+ Added" : d.type === "removed" ? "- Removed" : "~ Changed"}</span>
                  <span className="text-foreground">{d.path}</span>
                  {d.type === "changed" && <span className="text-muted-foreground ml-2">({d.oldValue} → {d.newValue})</span>}
                  {d.type === "added" && <span className="text-muted-foreground ml-2">({d.newValue})</span>}
                  {d.type === "removed" && <span className="text-muted-foreground ml-2">({d.oldValue})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default SchemaDiffPage;
