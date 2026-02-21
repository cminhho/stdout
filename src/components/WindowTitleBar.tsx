import React from "react";
import { useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";

/**
 * Title bar for frameless / custom-window desktop apps.
 * - Leftmost: collapse/expand sidebar.
 * - Drag region so the window can be moved.
 * - When the OS draws window controls in the title bar (e.g. traffic lights), we reserve space.
 * - Otherwise we render in-window close/minimize/maximize controls.
 */
const WindowTitleBar = () => {
  const location = useLocation();
  const { tools } = useToolEngine();
  const { sidebarCollapsed, toggleSidebar } = useSettings();
  const hasSystemTitleBarControls = window.electronAPI?.platform === "darwin";
  const hasWindowAPI = !!window.electronAPI?.window;

  const currentTool = tools.find((t) => t.path === location.pathname);
  const title = location.pathname === "/" ? "stdout" : currentTool?.label ?? "stdout";

  return (
    <header
      className="desktop-title-bar flex items-center shrink-0 h-10 px-3 gap-3"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="shrink-0" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      {hasSystemTitleBarControls && (
        <div className="w-[72px] shrink-0" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties} />
      )}
      {!hasSystemTitleBarControls && hasWindowAPI && (
        <div className="flex items-center gap-1 shrink-0" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-[#ff5f57] hover:opacity-90"
            onClick={() => window.electronAPI?.window?.close()}
            aria-label="Close"
          />
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-[#febc2e] hover:opacity-90"
            onClick={() => window.electronAPI?.window?.minimize()}
            aria-label="Minimize"
          />
          <button
            type="button"
            className="w-3 h-3 rounded-full bg-[#28c840] hover:opacity-90"
            onClick={() => window.electronAPI?.window?.maximize()}
            aria-label="Maximize"
          />
        </div>
      )}
      <div className="flex-1 min-w-0 flex justify-center pointer-events-none px-2">
        <span
          className={`text-xs font-medium text-foreground truncate ${hasSystemTitleBarControls ? "desktop-title-plain" : "title-tab"}`}
        >
          {title}
        </span>
      </div>
      <div className="w-[72px] shrink-0" />
    </header>
  );
};

export default WindowTitleBar;
