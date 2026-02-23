import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import TwoPanelTopSection from "@/components/TwoPanelTopSection";
import ToolResultCard from "@/components/ToolResultCard";
import CopyButton from "@/components/CopyButton";
import { buildEditorPaneProps } from "@/components/toolPaneBuilders";
import { useCurrentTool } from "@/hooks/useCurrentTool";

const SAMPLE_A = '{"id": 1, "name": "test", "roles": ["admin"]}';
const SAMPLE_B = '{"id": "1", "email": "x@y.z", "roles": ["user"]}';

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

function diffLine(d: DiffEntry): string {
  const prefix = d.type === "added" ? "+" : d.type === "removed" ? "-" : "~";
  const suffix = d.type === "changed" ? ` (${d.oldValue} → ${d.newValue})` : d.type === "added" ? ` (${d.newValue})` : ` (${d.oldValue})`;
  return `${prefix} ${d.path}${suffix}`;
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

  const diffText = result?.diff.map(diffLine).join("\n") ?? "";

  const leftPane = useMemo(
    () =>
      buildEditorPaneProps({
        title: "Schema A (JSON)",
        value: left,
        onChange: setLeft,
        onSample: () => setLeft(SAMPLE_A),
        placeholder: '{"id": 1, "name": "test"}',
        fileAccept: ".json,application/json",
      }),
    [left]
  );

  const rightPane = useMemo(
    () =>
      buildEditorPaneProps({
        title: "Schema B (JSON)",
        value: right,
        onChange: setRight,
        onSample: () => setRight(SAMPLE_B),
        placeholder: '{"id": "1", "email": "x@y.z"}',
        fileAccept: ".json,application/json",
      }),
    [right]
  );

  return (
    <ToolLayout title={tool?.label ?? "Schema Diff"} description={tool?.description ?? "Compare two JSON schemas side by side"}>
      <TwoPanelTopSection formatError={result?.error ? new Error(result.error) : undefined} />
      <ResizableTwoPanel input={leftPane} output={rightPane} className="flex-1 min-h-0" />

      {result && !result.error && (
        <ToolResultCard
          summary={
            result.diff.length === 0
              ? undefined
              : `${result.diff.length} difference${result.diff.length !== 1 ? "s" : ""}`
          }
          copyText={result.diff.length > 0 ? diffText : undefined}
        >
          {result.diff.length === 0 ? (
            <p className="text-sm text-muted-foreground">✓ Schemas are identical</p>
          ) : (
            <div className="space-y-1">
              {result.diff.map((d, i) => (
                <div
                  key={i}
                  className={`text-xs font-mono ${d.type === "added" ? "text-primary" : d.type === "removed" ? "text-destructive" : "text-accent-foreground"}`}
                >
                  <span className="inline-block w-24">
                    {d.type === "added" ? "+ Added" : d.type === "removed" ? "- Removed" : "~ Changed"}
                  </span>
                  <span className="text-foreground">{d.path}</span>
                  {d.type === "changed" && (
                    <span className="text-muted-foreground ml-2">({d.oldValue} → {d.newValue})</span>
                  )}
                  {d.type === "added" && <span className="text-muted-foreground ml-2">({d.newValue})</span>}
                  {d.type === "removed" && <span className="text-muted-foreground ml-2">({d.oldValue})</span>}
                </div>
              ))}
            </div>
          )}
        </ToolResultCard>
      )}
    </ToolLayout>
  );
};

export default SchemaDiffPage;
