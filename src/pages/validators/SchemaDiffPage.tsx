import { useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ResizableTwoPanel from "@/components/layout/ResizableTwoPanel";
import TwoPanelTopSection from "@/components/layout/TwoPanelTopSection";
import ToolResultCard from "@/components/common/ToolResultCard";
import DiffLineList, { type DiffLineEntry } from "@/components/common/DiffLineList";
import { useTwoPanelCompare } from "@/hooks/useTwoPanelCompare";
import { formatDiffSummary, formatDiffEntriesForCopy, IDENTICAL_MESSAGE_CLASS } from "@/utils/compareResultHelpers";

const SAMPLE_A = '{"id": 1, "name": "test", "roles": ["admin"]}';
const SAMPLE_B = '{"id": "1", "email": "x@y.z", "roles": ["user"]}';

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function diffObjects(a: unknown, b: unknown, path = ""): DiffLineEntry[] {
  const entries: DiffLineEntry[] = [];
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

const LEFT_CONFIG = {
  title: "Schema A (JSON)",
  sample: SAMPLE_A,
  placeholder: '{"id": 1, "name": "test"}',
  fileAccept: ".json,application/json",
} as const;

const RIGHT_CONFIG = {
  title: "Schema B (JSON)",
  sample: SAMPLE_B,
  placeholder: '{"id": "1", "email": "x@y.z"}',
  fileAccept: ".json,application/json",
} as const;

const SchemaDiffPage = () => {
  const { left, right, leftPane, rightPane } = useTwoPanelCompare(LEFT_CONFIG, RIGHT_CONFIG);

  const result = useMemo(() => {
    if (!left.trim() || !right.trim()) return null;
    try {
      return { diff: diffObjects(JSON.parse(left), JSON.parse(right)), error: null };
    } catch (e: unknown) {
      return { diff: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [left, right]);

  return (
    <ToolLayout>
      <TwoPanelTopSection formatError={result?.error ? new Error(result.error) : undefined} />
      <ResizableTwoPanel input={leftPane} output={rightPane} className="flex-1 min-h-0" />

      {result && !result.error && (
        <ToolResultCard
          summary={formatDiffSummary(result.diff.length)}
          copyText={result.diff.length > 0 ? formatDiffEntriesForCopy(result.diff) : undefined}
        >
          {result.diff.length === 0 ? (
            <p className={IDENTICAL_MESSAGE_CLASS}>✓ Schemas are identical</p>
          ) : (
            <DiffLineList entries={result.diff} />
          )}
        </ToolResultCard>
      )}
    </ToolLayout>
  );
};

export default SchemaDiffPage;
