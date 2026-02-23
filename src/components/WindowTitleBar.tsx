import React from "react";
import { useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";

const NO_DRAG = { WebkitAppRegion: "no-drag" } as React.CSSProperties;
const TRAFFIC_LIGHT_BASE = "w-3 h-3 rounded-full hover:opacity-80 active:opacity-70 transition-opacity";

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

  const windowButtons =
    hasWindowAPI &&
    [
      { ariaLabel: "Close", className: "bg-[#ff5f57]", onClick: () => window.electronAPI?.window?.close() },
      { ariaLabel: "Minimize", className: "bg-[#febc2e]", onClick: () => window.electronAPI?.window?.minimize() },
      { ariaLabel: "Maximize", className: "bg-[#28c840]", onClick: () => window.electronAPI?.window?.maximize() },
    ];

  return (
    <header
      className="desktop-title-bar relative flex items-center shrink-0"
      style={{ WebkitAppRegion: "drag", height: "var(--title-bar-height)", minHeight: "var(--title-bar-height)" } as React.CSSProperties}
    >
      <div className="shrink-0" style={NO_DRAG}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="btn-icon-chrome btn-icon-chrome-sm"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>
      {hasSystemTitleBarControls && <div className="title-bar-traffic-light-spacer shrink-0" style={NO_DRAG} />}
      {!hasSystemTitleBarControls && windowButtons && (
        <div className="flex items-center gap-1.5 shrink-0" style={NO_DRAG}>
          {windowButtons.map((b) => (
            <button
              key={b.ariaLabel}
              type="button"
              className={`${TRAFFIC_LIGHT_BASE} ${b.className}`}
              onClick={b.onClick}
              aria-label={b.ariaLabel}
            />
          ))}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-[var(--title-bar-padding-x)]">
        <span
          className={`title-bar-title truncate max-w-full ${hasSystemTitleBarControls ? "desktop-title-plain" : "title-tab"}`}
        >
          {title}
        </span>
      </div>
      <div className="title-bar-end-spacer shrink-0" style={NO_DRAG} />
    </header>
  );
};

export default WindowTitleBar;
