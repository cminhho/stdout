/**
 * Persistence for the open-tabs strip (VS Code–style tab workspace).
 * Each tab is an instance of a tool; multiple instances of the same tool are allowed. Content
 * travels with the tab (`input`), so it's bounded by the open-tab count and never evicted by the
 * workspace store's LRU. Pure module (no registry import); registry validation lives in the provider.
 */

const STORAGE_KEY = "stdout-tabs";

/** Max simultaneously-open tabs. Keep-alive mounts every open tab, so this bounds memory + stored content. */
export const MAX_OPEN_TABS = 12;

/** Max chars of per-tab input persisted, to avoid localStorage quota (mirrors workspaceStore). */
export const MAX_TAB_INPUT_LENGTH = 100_000;

/** One open tab = an instance of a tool. `id === toolId` for the first/primary instance. */
export interface Tab {
  id: string;
  toolId: string;
  /** Stable per-instance number for label disambiguation; assigned at creation, moves with the tab. */
  ordinal?: number;
  input?: string;
}

export interface TabsState {
  /** Ordered tabs, left→right. */
  tabs: Tab[];
  /** Active tab id (must be a member of `tabs`), or null when none are open. */
  activeTabId: string | null;
}

const defaults: TabsState = { tabs: [], activeTabId: null };

/** Coerce arbitrary input to a de-duplicated array of valid Tab objects. */
function parseTabs(raw: unknown): Tab[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: Tab[] = [];
  for (const v of raw) {
    if (typeof v !== "object" || v === null) continue;
    const o = v as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    const toolId = typeof o.toolId === "string" ? o.toolId : "";
    if (!id.trim() || !toolId.trim() || seen.has(id)) continue;
    seen.add(id);
    const input =
      typeof o.input === "string" ? o.input.slice(0, MAX_TAB_INPUT_LENGTH) : undefined;
    const ordinal = typeof o.ordinal === "number" ? o.ordinal : undefined;
    out.push({ id, toolId, ...(ordinal !== undefined && { ordinal }), ...(input !== undefined && { input }) });
  }
  return out;
}

/** Clamp activeTabId to a member of `tabs` (fall back to the last tab, or null). */
function clampActive(tabs: Tab[], active: string | null): string | null {
  if (active && tabs.some((t) => t.id === active)) return active;
  return tabs.length ? tabs[tabs.length - 1].id : null;
}

export function loadTabs(): TabsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const tabs = parseTabs(parsed.tabs).slice(-MAX_OPEN_TABS);
      const activeTabId = clampActive(
        tabs,
        typeof parsed.activeTabId === "string" ? parsed.activeTabId : null
      );
      return { tabs, activeTabId };
    }
  } catch {
    /* invalid */
  }
  return defaults;
}

export function saveTabs(state: TabsState): void {
  try {
    const tabs = state.tabs.slice(-MAX_OPEN_TABS).map((t) => ({
      id: t.id,
      toolId: t.toolId,
      ...(typeof t.ordinal === "number" && { ordinal: t.ordinal }),
      ...(typeof t.input === "string" && { input: t.input.slice(0, MAX_TAB_INPUT_LENGTH) }),
    }));
    const activeTabId = clampActive(tabs, state.activeTabId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs, activeTabId }));
  } catch {
    /* quota or other */
  }
}
