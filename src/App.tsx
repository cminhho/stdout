import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import AppSidebar from "@/components/AppSidebar";
import WindowTitleBar from "@/components/WindowTitleBar";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useToolTracking } from "@/hooks/useToolTracking";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/NotFound";
import HomePage from "@/pages/HomePage";

const useHashRouter = typeof window !== "undefined" && window.location?.protocol === "file:";
const Router = useHashRouter ? HashRouter : BrowserRouter;

const ToolRoutes = () => {
  const { tools } = useToolEngine();
  const navigate = useNavigate();

  useToolTracking();

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

const App = () => {
  return (
    <TooltipProvider>
      <Router>
        <SettingsProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen overflow-hidden">
            <WindowTitleBar />
            <div className="desktop-layout flex flex-1 min-h-0 overflow-hidden min-w-0">
              <AppSidebar />
              <main className="flex-1 min-h-0 min-w-0 overflow-auto flex flex-col">
                <ToolRoutes />
              </main>
            </div>
          </div>
        </SettingsProvider>
      </Router>
    </TooltipProvider>
  );
};

export default App;
