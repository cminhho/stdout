import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getToolById, getToolByPath } from "@/tools";
import { useTabs } from "@/contexts/TabsContext";

/**
 * Shared tab activate/close-with-navigation, so the TabBar strip and the sidebar "Open Tools"
 * list behave identically. Closing the visible tab navigates to a neighbor (right → left), or
 * Home when the last tab closes.
 */
export function useTabNavigation() {
  const { tabs, closeTab, activateTab } = useTabs();
  const location = useLocation();
  const navigate = useNavigate();

  const selectTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab) return;
      activateTab(tabId);
      const tool = getToolById(tab.toolId);
      if (tool) navigate(tool.path);
    },
    [tabs, activateTab, navigate]
  );

  const closeTabWithNav = useCallback(
    (tabId: string) => {
      const idx = tabs.findIndex((t) => t.id === tabId);
      if (idx === -1) return;
      // Is the tab being closed the one currently shown?
      const routedId = getToolByPath(location.pathname)?.id;
      const wasVisible = routedId === tabs[idx].toolId;
      closeTab(tabId);
      if (!wasVisible) return;
      const remaining = tabs.filter((t) => t.id !== tabId);
      if (remaining.length === 0) {
        navigate("/");
        return;
      }
      const neighbor = remaining[Math.min(idx, remaining.length - 1)];
      const tool = getToolById(neighbor.toolId);
      if (tool) navigate(tool.path);
    },
    [tabs, closeTab, navigate, location.pathname]
  );

  return { selectTab, closeTabWithNav };
}
