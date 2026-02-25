import { useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import TwoPanelTopSection from "@/components/TwoPanelTopSection";
import ToolResultCard from "@/components/ToolResultCard";
import CodeEditor from "@/components/CodeEditor";
import { useTwoPanelCompare } from "@/hooks/useTwoPanelCompare";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { formatDiffSummary, IDENTICAL_MESSAGE_CLASS } from "@/utils/compareResultHelpers";

const SAMPLE_A = '{"status": "ok", "data": [1, 2, 3], "count": 3}';
const SAMPLE_B = '{"status": "error", "data": [1, 2], "count": 2}';

interface Diff {
  path: string;
  type: "added" | "removed" | "changed";
  oldVal?: unknown;
  newVal?: unknown;
}

function deepDiff(a: unknown, b: unknown, path = ""): Diff[] {
  const diffs: Diff[] = [];
  if (a === b) return diffs;
  if (typeof a !== typeof b || a === null || b === null) {
    diffs.push({ path: path || "(root)", type: "changed", oldVal: a, newVal: b });
    return diffs;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) diffs.push({ path: p, type: "added", newVal: b[i] });
      else if (i >= b.length) diffs.push({ path: p, type: "removed", oldVal: a[i] });
      else diffs.push(...deepDiff(a[i], b[i], p));
    }
  } else if (typeof a === "object") {
    const oa = a as Record<string, unknown>, ob = b as Record<string, unknown>;
    const keysA = Object.keys(oa);
    const keysB = Object.keys(ob);
    const allKeys = new Set([...keysA, ...keysB]);
    for (const key of allKeys) {
      const p = path ? `${path}.${key}` : key;
      if (!(key in oa)) diffs.push({ path: p, type: "added", newVal: ob[key] });
      else if (!(key in ob)) diffs.push({ path: p, type: "removed", oldVal: oa[key] });
      else diffs.push(...deepDiff(oa[key], ob[key], p));
    }
  } else {
    diffs.push({ path: path || "(root)", type: "changed", oldVal: a, newVal: b });
  }
  return diffs;
}

function diffLine(d: Diff): string {
  return `${d.type} ${d.path}: ${d.type === "changed" ? `${JSON.stringify(d.oldVal)} → ${JSON.stringify(d.newVal)}` : JSON.stringify(d.newVal ?? d.oldVal)}`;
}

const LEFT_CONFIG = {
  title: "Payload A",
  sample: SAMPLE_A,
  placeholder: '{"status": "ok", "data": [1,2,3]}',
  fileAccept: ".json,application/json",
} as const;

const RIGHT_CONFIG = {
  title: "Payload B",
  sample: SAMPLE_B,
  placeholder: '{"status": "error", "data": [1,2]}',
  fileAccept: ".json,application/json",
} as const;

const PayloadComparatorPage = () => {
  const tool = useCurrentTool();
  const { left, right, leftPane, rightPane } = useTwoPanelCompare(LEFT_CONFIG, RIGHT_CONFIG);

  const result = useMemo(() => {
    if (!left.trim() || !right.trim()) return null;
    try {
      return { diffs: deepDiff(JSON.parse(left), JSON.parse(right)), error: null };
    } catch (e: unknown) {
      return { diffs: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [left, right]);

  const diffText = result?.diffs.map(diffLine).join("\n") ?? "";

  return (
    <ToolLayout>
      <TwoPanelTopSection formatError={result?.error ? new Error(result.error) : undefined} />
      <ResizableTwoPanel input={leftPane} output={rightPane} className="flex-1 min-h-0" />

      {result && !result.error && (
        <ToolResultCard
          summary={formatDiffSummary(result.diffs.length)}
          copyText={result.diffs.length > 0 ? diffText : undefined}
        >
          {result.diffs.length === 0 ? (
            <p className={IDENTICAL_MESSAGE_CLASS}>✓ Payloads are identical</p>
          ) : (
            <div className="min-h-0 flex flex-col max-h-[50vh] rounded border overflow-hidden border-[hsl(var(--code-border))] bg-[hsl(var(--code-bg))]">
              <CodeEditor value={diffText} readOnly language="text" fillHeight />
            </div>
          )}
        </ToolResultCard>
      )}
    </ToolLayout>
  );
};

export default PayloadComparatorPage;
