import { Suspense, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import { getRecentPaths } from "@/tools/recentTools";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";

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

  useToolTracking();

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
            <Route key={tool.id} path={tool.path} element={<tool.component />} />
          ))}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
