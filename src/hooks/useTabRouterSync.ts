/**
 * Keeps React Router and the tab strip in sync.
 *
 *  - URL → tabs: navigating to a tool path (sidebar, command palette, deep link, back/forward) opens
 *    or focuses an instance of that tool. The reverse (tab → URL) is driven explicitly by TabBar
 *    (click/close call `navigate`), which avoids loops. Switching between instances of the SAME tool
 *    doesn't change the URL — TabBar drives that via `activateTab`.
 *  - Initial restore: when the app loads at "/", jump to the previously-active tab's tool (or last path).
 */
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useTabs } from "@/contexts/TabsContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function useTabRouterSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToolByPath, getToolById } = useToolEngine();
  const { tabs, activeTabId, openTab } = useTabs();
  const { lastPath } = useWorkspace();
  const restored = useRef(false);

  // URL → open/focus an instance of the matching tool.
  useEffect(() => {
    const tool = getToolByPath(location.pathname);
    if (tool) openTab(tool.id);
  }, [location.pathname, getToolByPath, openTab]);

  // One-time restore on cold load: land on the previously-active tab's tool (fallback to last path).
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    if (location.pathname !== "/") return;
    const activeTab = tabs.find((t) => t.id === activeTabId);
    if (activeTab) {
      const tool = getToolById(activeTab.toolId);
      if (tool) {
        navigate(tool.path, { replace: true });
        return;
      }
    }
    if (lastPath && lastPath !== "/" && getToolByPath(lastPath)) {
      navigate(lastPath, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
