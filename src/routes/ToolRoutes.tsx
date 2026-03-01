import { Suspense, useEffect, useRef } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ToolErrorBoundary } from "@/components/tools/ToolErrorBoundary";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import { getRecentPaths } from "@/tools/recentTools";
import SettingsPage from "@/pages/settings";

/** Paths of high-use tools to preload at startup for faster first navigation (Electron + web). */
const CRITICAL_TOOL_PATHS = ["/formatters/json", "/encode/base64", "/encode/jwt"];
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";
import OpenRoutePage from "@/pages/OpenRoutePage";

const APP_TITLE = "stdout";

const SUSPENSE_FALLBACK = (
  <div
    className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground min-h-0"
    aria-live="polite"
    aria-busy="true"
  >
    <span
      className="inline-block h-5 w-5 rounded-full border-[1.5px] border-current border-t-transparent animate-spin"
      aria-hidden
    />
    <span className="text-[13px] font-normal tracking-[0.01em] text-muted-foreground/90">
      Loading…
    </span>
  </div>
);

/**
 * Route tree: Home, tool routes from registry, Settings, NotFound.
 * Wrapped in ErrorBoundary and Suspense for lazy tool chunks.
 */
export function ToolRoutes() {
  const location = useLocation();
  const { tools, getToolByPath } = useToolEngine();
  const navigate = useNavigate();
  const { lastPath, setLastPath } = useWorkspace();
  const hasRestored = useRef(false);

  useToolTracking();

  // Restore last path on initial load when user lands on "/"
  useEffect(() => {
    if (hasRestored.current) return;
    if (location.pathname !== "/") return;
    if (!lastPath || lastPath === "/") return;
    const valid =
      lastPath === "/" ||
      getToolByPath(lastPath) !== undefined;
    if (valid && lastPath !== "/") {
      hasRestored.current = true;
      navigate(lastPath, { replace: true });
    }
  }, [lastPath, location.pathname, navigate, getToolByPath]);

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

  // Preload recent tools in idle time so they open instantly when revisited
  useEffect(() => {
    if (typeof requestIdleCallback === "undefined") return;
    const id = requestIdleCallback(() => {
      getRecentPaths().forEach((path) => getToolByPath(path)?.preload?.());
    }, { timeout: 2000 });
    return () => cancelIdleCallback(id);
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
      <Suspense fallback={SUSPENSE_FALLBACK}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {tools.map((tool) => (
            <Route
              key={tool.id}
              path={tool.path}
              element={
                <ToolErrorBoundary toolId={tool.id} toolLabel={tool.label}>
                  <tool.component />
                </ToolErrorBoundary>
              }
            />
          ))}
          <Route path="/open" element={<OpenRoutePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
