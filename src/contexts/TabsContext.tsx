/**
 * Open-tabs state for the VS Code–style tab strip. Tabs are tool *instances* — multiple tabs of the
 * same tool are allowed (each with its own content). Default open focuses an existing instance;
 * `openNewInstance` creates a fresh one. Persisted via tabsStore (debounced + beforeunload flush).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getToolById } from "@/tools";
import { loadTabs, saveTabs, MAX_OPEN_TABS, type Tab, type TabsState } from "@/contexts/tabsStore";
import { debounce } from "@/utils/debounce";

export interface TabsContextType extends TabsState {
  /** Focus an existing instance of the tool, or open a (primary) one if none exists. */
  openTab: (toolId: string) => void;
  /** Always open a new, empty instance of the tool (explicit "New tab"). */
  openNewInstance: (toolId: string) => void;
  /** Close a tab; if it was active, activate the right neighbor (else left), or null when empty. */
  closeTab: (tabId: string) => void;
  /** Make an already-open tab active. */
  activateTab: (tabId: string) => void;
  /** Move tab `fromId` to the slot of `toId` (drag-to-reorder). */
  reorderTab: (fromId: string, toId: string) => void;
  /** Update a tab's persisted content. */
  setTabInput: (tabId: string, input: string) => void;
  /** Read a tab's persisted content (undefined if unset). */
  getTabInput: (tabId: string) => string | undefined;
}

const TabsContext = createContext<TabsContextType | null>(null);

const PERSIST_DEBOUNCE_MS = 1000;

/** Drop tabs whose tool no longer exists (removed/renamed) and clamp the active id. */
function reconcile(state: TabsState): TabsState {
  const tabs = state.tabs.filter((t) => getToolById(t.toolId) !== undefined);
  const activeTabId =
    state.activeTabId && tabs.some((t) => t.id === state.activeTabId)
      ? state.activeTabId
      : tabs.length
        ? tabs[tabs.length - 1].id
        : null;
  return { tabs, activeTabId };
}

/** Append a tab, evicting the oldest non-active/non-new tab when over the cap. */
function appendCapped(tabs: Tab[], tab: Tab, prevActive: string | null): Tab[] {
  let next = [...tabs, tab];
  if (next.length > MAX_OPEN_TABS) {
    const evict = next.find((t) => t.id !== prevActive && t.id !== tab.id);
    if (evict) next = next.filter((t) => t.id !== evict.id);
  }
  return next;
}

/** Next stable per-tool instance number (1-based), so duplicate-tab labels survive reordering. */
function nextOrdinal(tabs: Tab[], toolId: string): number {
  let max = 0;
  for (const t of tabs) {
    if (t.toolId === toolId && typeof t.ordinal === "number" && t.ordinal > max) max = t.ordinal;
  }
  return max + 1;
}

export function TabsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TabsState>(() => reconcile(loadTabs()));

  const openTab = useCallback((toolId: string) => {
    if (!toolId.trim() || !getToolById(toolId)) return;
    setState((prev) => {
      const sameTool = prev.tabs.filter((t) => t.toolId === toolId);
      if (sameTool.length > 0) {
        // Focus an existing instance: keep current active if it's already this tool, else the last one.
        const active = sameTool.some((t) => t.id === prev.activeTabId)
          ? prev.activeTabId!
          : sameTool[sameTool.length - 1].id;
        return prev.activeTabId === active ? prev : { ...prev, activeTabId: active };
      }
      // Primary instance uses id === toolId (backward-compatible with stored content / deep-links).
      const tabs = appendCapped(
        prev.tabs,
        { id: toolId, toolId, ordinal: nextOrdinal(prev.tabs, toolId) },
        prev.activeTabId
      );
      return { tabs, activeTabId: toolId };
    });
  }, []);

  const openNewInstance = useCallback((toolId: string) => {
    if (!toolId.trim() || !getToolById(toolId)) return;
    setState((prev) => {
      // If no instance exists yet, the new one is the primary (id === toolId); else a fresh uuid.
      const exists = prev.tabs.some((t) => t.toolId === toolId);
      const id = exists ? `${toolId}~${crypto.randomUUID()}` : toolId;
      const tabs = appendCapped(
        prev.tabs,
        { id, toolId, ordinal: nextOrdinal(prev.tabs, toolId) },
        prev.activeTabId
      );
      return { tabs, activeTabId: id };
    });
  }, []);

  const closeTab = useCallback((tabId: string) => {
    setState((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === tabId);
      if (idx === -1) return prev;
      const tabs = prev.tabs.filter((t) => t.id !== tabId);
      let activeTabId = prev.activeTabId;
      if (prev.activeTabId === tabId) {
        activeTabId = tabs.length ? tabs[Math.min(idx, tabs.length - 1)].id : null;
      }
      return { tabs, activeTabId };
    });
  }, []);

  const activateTab = useCallback((tabId: string) => {
    setState((prev) =>
      prev.tabs.some((t) => t.id === tabId) && prev.activeTabId !== tabId
        ? { ...prev, activeTabId: tabId }
        : prev
    );
  }, []);

  const reorderTab = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return;
    setState((prev) => {
      const from = prev.tabs.findIndex((t) => t.id === fromId);
      const to = prev.tabs.findIndex((t) => t.id === toId);
      if (from === -1 || to === -1) return prev;
      const tabs = prev.tabs.slice();
      const [moved] = tabs.splice(from, 1);
      tabs.splice(tabs.findIndex((t) => t.id === toId), 0, moved); // insert before target
      return { ...prev, tabs };
    });
  }, []);

  const setTabInput = useCallback((tabId: string, input: string) => {
    setState((prev) => {
      const idx = prev.tabs.findIndex((t) => t.id === tabId);
      if (idx === -1 || prev.tabs[idx].input === input) return prev;
      const tabs = prev.tabs.slice();
      tabs[idx] = { ...tabs[idx], input };
      return { ...prev, tabs };
    });
  }, []);

  const getTabInput = useCallback(
    (tabId: string) => state.tabs.find((t) => t.id === tabId)?.input,
    [state.tabs]
  );

  useEffect(() => {
    const debouncedSave = debounce(() => saveTabs(state), PERSIST_DEBOUNCE_MS);
    debouncedSave();
    const onBeforeUnload = () => {
      debouncedSave.cancel();
      saveTabs(state);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      debouncedSave.cancel();
      window.removeEventListener("beforeunload", onBeforeUnload);
      saveTabs(state);
    };
  }, [state]);

  const value = useMemo<TabsContextType>(
    () => ({
      ...state,
      openTab,
      openNewInstance,
      closeTab,
      activateTab,
      reorderTab,
      setTabInput,
      getTabInput,
    }),
    [state, openTab, openNewInstance, closeTab, activateTab, reorderTab, setTabInput, getTabInput]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextType {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs must be used within TabsProvider");
  return ctx;
}
