import { Suspense, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, HashRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX } from "@/contexts/settingsStore";
import AppSidebar from "@/components/AppSidebar";
import PanelResizer from "@/components/PanelResizer";
import WindowTitleBar from "@/components/WindowTitleBar";
import { useSettings } from "@/hooks/useSettings";
import { useSidebarResize } from "@/hooks/useSidebarResize";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";

const useHashRouter = typeof window !== "undefined" && window.location?.protocol === "file:";
const Router = useHashRouter ? HashRouter : BrowserRouter;

const APP_TITLE = "stdout";

const ToolRoutes = () => {
  const location = useLocation();
  const { tools } = useToolEngine();
  const navigate = useNavigate();

  useToolTracking();

  useEffect(() => {
    const segment = location.pathname === "/" ? "Home" : location.pathname === "/settings" ? "Settings" : tools.find((t) => t.path === location.pathname)?.label;
    document.title = segment ? `${segment} — ${APP_TITLE}` : APP_TITLE;
  }, [location.pathname, tools]);

  useEffect(() => {
    const menu = (window as { electronAPI?: { menu?: { onOpenSettings: (cb: () => void) => () => void; onCheckUpdates: (cb: () => void) => () => void } } }).electronAPI?.menu;
    if (!menu) return;
    const unsubSettings = menu.onOpenSettings(() => navigate("/settings"));
    const unsubCheck = menu.onCheckUpdates(() => navigate("/settings?checkUpdates=1"));
    return () => {
      unsubSettings();
      unsubCheck();
    };
  }, [navigate]);

  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Loading tool...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        {tools.map((tool) => (
          <Route key={tool.id} path={tool.path} element={<tool.component />} />
        ))}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const DesktopLayout = () => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const { sidebarCollapsed, sidebarWidth, setSidebarWidth } = useSettings();
  const { widthPx, onMouseDown, onKeyDown } = useSidebarResize(layoutRef, {
    minPx: SIDEBAR_WIDTH_MIN,
    maxPx: SIDEBAR_WIDTH_MAX,
    value: sidebarWidth,
    onChange: setSidebarWidth,
  });

  const resizerPercent =
    ((widthPx - SIDEBAR_WIDTH_MIN) / (SIDEBAR_WIDTH_MAX - SIDEBAR_WIDTH_MIN)) * 100;

  return (
    <div className="desktop-layout flex flex-1 min-h-0 overflow-hidden min-w-0" ref={layoutRef}>
      <AppSidebar sidebarWidthPx={sidebarCollapsed ? undefined : widthPx} />
      {!sidebarCollapsed && (
        <PanelResizer
          orientation="vertical"
          percent={resizerPercent}
          minPercent={0}
          maxPercent={100}
          ariaLabel="Resize sidebar"
          onMouseDown={onMouseDown}
          onKeyDown={onKeyDown}
        />
      )}
      <main className="flex-1 min-h-0 min-w-0 overflow-auto flex flex-col">
        <ToolRoutes />
      </main>
    </div>
  );
};

const App = () => {
  return (
    <TooltipProvider>
      <Router>
        <SettingsProvider>
          <Toaster />
          <div className="flex flex-col h-screen overflow-hidden min-w-0">
            <WindowTitleBar />
            <DesktopLayout />
          </div>
        </SettingsProvider>
      </Router>
    </TooltipProvider>
  );
};

export default App;
