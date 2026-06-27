import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import { useTabRouterSync } from "@/hooks/useTabRouterSync";
import RouteSurface from "@/routes/RouteSurface";
import TabHost from "@/components/layout/TabHost";

/** Paths of high-use tools to preload at startup for faster first navigation (Electron + web). */
const CRITICAL_TOOL_PATHS = ["/formatters/json", "/encode/base64", "/encode/jwt"];

const APP_TITLE = "stdout";

/**
 * App content orchestrator: keeps tabs in sync with the URL, runs preload / document.title /
 * electron-menu / tracking effects, and renders the non-tool routes (RouteSurface) alongside the
 * keep-alive tool tabs (TabHost).
 */
export function ToolRoutes() {
  const location = useLocation();
  const { tools, getToolByPath } = useToolEngine();
  const navigate = useNavigate();
  const { setLastPath } = useWorkspace();

  useToolTracking();
  useTabRouterSync();

  // Persist current path as lastPath (skip /settings and /open so next open goes to last tool)
  useEffect(() => {
    const path = location.pathname;
    if (path === "/settings" || path === "/open") return;
    setLastPath(path);
  }, [location.pathname, setLastPath]);

  // Preload critical tool chunks immediately for faster startup / first tool open
  useEffect(() => {
    CRITICAL_TOOL_PATHS.forEach((p) => getToolByPath(p)?.preload?.());
  }, [getToolByPath]);

  useEffect(() => {
    const segment =
      location.pathname === "/"
        ? "Home"
        : location.pathname === "/settings"
          ? "Settings"
          : tools.find((t) => t.path === location.pathname)?.label;
    document.title = segment ? `${segment} — ${APP_TITLE}` : APP_TITLE;
  }, [location.pathname, tools]);

  useEffect(() => {
    const menu = window.electronAPI?.menu;
    if (!menu) return;
    const unsubSettings = menu.onOpenSettings(() => navigate("/settings"));
    const unsubCheck = menu.onCheckUpdates(() => navigate("/settings?checkUpdates=1"));
    return () => {
      unsubSettings();
      unsubCheck();
    };
  }, [navigate]);

  return (
    <ErrorBoundary>
      <RouteSurface />
      <TabHost />
    </ErrorBoundary>
  );
}
