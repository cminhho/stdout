import type { DiffLineEntry } from "@/components/common/DiffLineList";

/**
 * Shared helpers for two-panel compare tools (Payload Comparator, Schema Diff).
 * Keeps summary text and identical-message styling consistent (VS Code / design tokens).
 */

/** Returns undefined when count is 0 (no summary), otherwise "N difference(s)". */
export function formatDiffSummary(count: number): string | undefined {
  if (count === 0) return undefined;
  return `${count} difference${count !== 1 ? "s" : ""}`;
}

/** Tailwind classes for the "✓ ... identical" message (text-ui size, muted foreground). */
export const IDENTICAL_MESSAGE_CLASS = "text-sm text-muted-foreground";

/** Format diff entries as plain text for copy-to-clipboard (Schema Diff). */
export function formatDiffEntriesForCopy(entries: DiffLineEntry[]): string {
  return entries
    .map((d) => {
      const prefix = d.type === "added" ? "+" : d.type === "removed" ? "-" : "~";
      const suffix =
        d.type === "changed"
          ? ` (${d.oldValue} → ${d.newValue})`
          : d.type === "added"
            ? ` (${d.newValue})`
            : ` (${d.oldValue})`;
      return `${prefix} ${d.path}${suffix}`;
    })
    .join("\n");
}
