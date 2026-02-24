import type React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";

const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

/** Title bar: sidebar toggle, title, Settings. On Electron: drag region + optional window controls. */
const WindowTitleBar = () => {
  const location = useLocation();
  const { tools } = useToolEngine();
  const { sidebarCollapsed, toggleSidebar } = useSettings();
  const electron = typeof window !== "undefined" ? window.electronAPI : undefined;
  const isMac = electron?.platform === "darwin";
  const win = electron?.window;
  const title =
    location.pathname === "/"
      ? "Home"
      : location.pathname === "/settings"
        ? "Settings"
        : tools.find((t) => t.path === location.pathname)?.label ?? "stdout";

  return (
    <header
      className="desktop-title-bar relative flex items-center shrink-0"
      style={{ WebkitAppRegion: "drag", height: "var(--title-bar-height)", minHeight: "var(--title-bar-height)" } as React.CSSProperties}
    >
      <div className="shrink-0" style={noDrag}>
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
      {isMac && <div className="title-bar-traffic-light-spacer shrink-0" style={noDrag} />}
      {!isMac && win && (
        <div className="flex items-center gap-2 shrink-0" style={noDrag}>
          {[
            { ariaLabel: "Close", className: "bg-[#ff5f57]", onClick: () => win.close() },
            { ariaLabel: "Minimize", className: "bg-[#febc2e]", onClick: () => win.minimize() },
            { ariaLabel: "Maximize", className: "bg-[#28c840]", onClick: () => win.maximize() },
          ].map((b) => (
            <button key={b.ariaLabel} type="button" className={`w-3 h-3 rounded-full hover:opacity-80 active:opacity-70 transition-opacity ${b.className}`} onClick={b.onClick} aria-label={b.ariaLabel} />
          ))}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-[var(--title-bar-padding-x)]">
        <span className={`title-bar-title truncate max-w-full ${isMac ? "desktop-title-plain" : "title-tab"}`}>{title}</span>
      </div>
      <div className="absolute top-0 bottom-0 right-0 flex items-center justify-end pr-[var(--title-bar-padding-x)] pointer-events-none [&>*]:pointer-events-auto" style={noDrag}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to="/settings" className="btn-icon-chrome btn-icon-chrome-sm shrink-0" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>
      </div>
      <div className="title-bar-end-spacer shrink-0" style={noDrag} />
    </header>
  );
};

export default WindowTitleBar;
