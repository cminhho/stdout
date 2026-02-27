import { useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX } from "@/contexts/settingsStore";
import TitleBar from "@/components/layout/TitleBar";
import Sidebar from "@/components/layout/Sidebar";
import PanelResizer from "@/components/layout/PanelResizer";
import { ToolRoutes } from "@/routes/ToolRoutes";
import { useSettings } from "@/hooks/useSettings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSidebarResize } from "@/hooks/useSidebarResize";

const useHashRouter =
  typeof window !== "undefined" &&
  (window.location?.protocol === "file:" || window.location?.protocol === "app:");
const Router = useHashRouter ? HashRouter : BrowserRouter;

const DesktopLayout = () => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { sidebarCollapsed, sidebarWidth, setSidebarWidth, toggleSidebar } = useSettings();
  const { widthPx, onMouseDown, onKeyDown } = useSidebarResize(layoutRef, {
    minPx: SIDEBAR_WIDTH_MIN,
    maxPx: SIDEBAR_WIDTH_MAX,
    value: sidebarWidth,
    onChange: setSidebarWidth,
  });

  const resizerPercent =
    ((widthPx - SIDEBAR_WIDTH_MIN) / (SIDEBAR_WIDTH_MAX - SIDEBAR_WIDTH_MIN)) * 100;
  const isOverlay = isMobile && !sidebarCollapsed;

  return (
    <div className="desktop-layout flex flex-1 min-h-0 overflow-hidden min-w-0" ref={layoutRef}>
      {isOverlay && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 cursor-pointer border-0"
          aria-label="Close sidebar"
          onClick={toggleSidebar}
        />
      )}
      <Sidebar
        sidebarWidthPx={sidebarCollapsed ? undefined : widthPx}
        isOverlay={isOverlay}
      />
      {!isMobile && !sidebarCollapsed && (
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
            <TitleBar />
            <DesktopLayout />
          </div>
        </SettingsProvider>
      </Router>
    </TooltipProvider>
  );
};

export default App;
