import { getToolById } from "@/tools";
import type { Tab } from "@/contexts/tabsStore";

/**
 * Display label per tab. When a tool has more than one open instance, labels get an ordinal
 * ("JSON Format", "JSON Format 2", …) so duplicate tabs are distinguishable. Shared by the
 * TabBar strip and the sidebar "Open Tools" list so they always read identically.
 */
export function tabDisplayLabels(tabs: Tab[]): Map<string, string> {
  const totals = new Map<string, number>();
  for (const t of tabs) totals.set(t.toolId, (totals.get(t.toolId) ?? 0) + 1);

  const seen = new Map<string, number>();
  const labels = new Map<string, string>();
  for (const tab of tabs) {
    const tool = getToolById(tab.toolId);
    const base = tool?.label ?? tab.toolId;
    const positional = (seen.get(tab.toolId) ?? 0) + 1;
    seen.set(tab.toolId, positional);
    // Stable per-instance ordinal (assigned at creation) so labels don't renumber on reorder;
    // fall back to positional for legacy tabs persisted before ordinals existed.
    const n = tab.ordinal ?? positional;
    labels.set(tab.id, (totals.get(tab.toolId) ?? 1) > 1 ? `${base} ${n}` : base);
  }
  return labels;
}
