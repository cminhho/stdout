/**
 * Per-tab identity. In keep-alive mode every open tab is mounted at once and they all share one URL,
 * so a tool page can't tell its instance apart from the pathname. Each mounted tab is wrapped in this
 * provider: `tabId` identifies the instance (for content), `toolId` the tool, `isActive` the visible one.
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

interface TabToolContextValue {
  /** Instance id (equals toolId for the primary instance). */
  tabId: string;
  toolId: string;
  /** True only for the currently visible tab (owns the title bar). */
  isActive: boolean;
}

const TabToolContext = createContext<TabToolContextValue | null>(null);

export function TabToolProvider({
  tabId,
  toolId,
  isActive,
  children,
}: {
  tabId: string;
  toolId: string;
  isActive: boolean;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ tabId, toolId, isActive }), [tabId, toolId, isActive]);
  return <TabToolContext.Provider value={value}>{children}</TabToolContext.Provider>;
}

/** Returns the per-tab identity, or null when rendered outside a tab (Home/Settings/legacy). */
export function useTabToolContextOptional(): TabToolContextValue | null {
  return useContext(TabToolContext);
}
