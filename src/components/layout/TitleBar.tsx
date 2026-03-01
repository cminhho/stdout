import type React from "react";
import { memo, useMemo, useCallback, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { PanelLeftClose, PanelLeftOpen, Settings, Sun, Moon, MoreVertical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/utils/cn";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";
import { useTitleBarActionsOptional } from "@/contexts/TitleBarActionsContext";
import SaveSessionButton from "@/components/common/SaveSessionButton";
import ShareSnippetButton from "@/components/common/ShareSnippetButton";
import SessionListContent from "@/components/common/SessionListContent";

const noDrag = { WebkitAppRegion: "no-drag" } as React.CSSProperties;

/** Title bar: sidebar toggle, title, Save/Share/Sessions when set via context, theme, Settings. On Electron: drag region + window controls + double-click to maximize. */
export const TitleBar = memo(function TitleBar() {
  const location = useLocation();
  const { tools } = useToolEngine();
  const { theme, setTheme, sidebarCollapsed, toggleSidebar } = useSettings();
  const titleBarActions = useTitleBarActionsOptional();
  const actions = titleBarActions?.actions ?? null;
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const isDark = useMemo(() => {
    if (theme === "light") return false;
    if (theme === "dark" || theme === "deep-dark") return true;
    return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);
  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  const handleDoubleClick = useCallback(() => {
    const win = window.electronAPI?.window;
    if (win) win.maximize();
  }, []);

  const handleLoadSession = useCallback(
    (state: Parameters<NonNullable<typeof actions>["onLoadSession"]>[0]) => {
      actions?.onLoadSession?.(state);
      setSessionsOpen(false);
    },
    [actions]
  );

  const electron = typeof window !== "undefined" ? window.electronAPI : undefined;
  const isMac = electron?.platform === "darwin";
  const win = electron?.window;
  const title =
    location.pathname === "/"
      ? "Home"
      : location.pathname === "/settings"
        ? "Settings"
        : tools.find((t) => t.path === location.pathname)?.label ?? "stdout";

  const showSessionShare = actions && actions.toolId != null && actions.toolId !== "" && actions.shareState != null;

  return (
    <header
      className="desktop-title-bar relative flex items-center shrink-0"
      style={{ WebkitAppRegion: "drag", height: "var(--title-bar-height)", minHeight: "var(--title-bar-height)" } as React.CSSProperties}
      role="banner"
      onDoubleClick={handleDoubleClick}
    >
      <div className="title-bar-left flex items-center shrink-0" style={noDrag}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="btn-icon-chrome btn-icon-chrome-sm cursor-pointer"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" aria-hidden /> : <PanelLeftClose className="h-4 w-4" aria-hidden />}
        </button>
        {isMac && <div className="title-bar-traffic-light-spacer shrink-0" aria-hidden />}
        {!isMac && win && (
          <div className="title-bar-win-controls flex items-center gap-1.5 shrink-0">
            {[
              { ariaLabel: "Close", className: "bg-[#ff5f57]", onClick: () => win.close() },
              { ariaLabel: "Minimize", className: "bg-[#febc2e]", onClick: () => win.minimize() },
              { ariaLabel: "Maximize", className: "bg-[#28c840]", onClick: () => win.maximize() },
            ].map((b) => (
              <button
                key={b.ariaLabel}
                type="button"
                className={cn("title-bar-win-btn w-3 h-3 rounded-full cursor-pointer hover:opacity-90 active:opacity-70 transition-opacity", b.className)}
                onClick={b.onClick}
                aria-label={b.ariaLabel}
              />
            ))}
          </div>
        )}
      </div>
      <div className="title-bar-center absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className={cn("title-bar-title truncate max-w-full", isMac ? "desktop-title-plain" : "title-tab")}>{title}</span>
      </div>
      <div className="title-bar-right absolute top-0 bottom-0 right-0 flex items-center justify-end pr-[var(--title-bar-edge)] pointer-events-none [&>*]:pointer-events-auto mr-2 gap-1" style={noDrag}>
        {showSessionShare && actions?.toolId && actions?.shareState ? (
          <div className="title-bar-actions flex items-center gap-1 shrink-0">
            <SaveSessionButton
              toolId={actions.toolId}
              currentState={actions.shareState}
              className="h-7 w-7 p-0"
            />
            <ShareSnippetButton
              toolId={actions.toolId}
              state={actions.shareState}
              className="h-7 w-7 p-0"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0"
                  aria-label="Sessions"
                  title="Sessions"
                  onClick={() => setSessionsOpen(true)}
                >
                  <MoreVertical className="h-4 w-4" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Sessions</TooltipContent>
            </Tooltip>
          </div>
        ) : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-icon-chrome btn-icon-chrome-sm shrink-0 cursor-pointer"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{isDark ? "Light theme" : "Dark theme"}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to="/settings" className="btn-icon-chrome btn-icon-chrome-sm shrink-0 cursor-pointer" aria-label="Settings">
              <Settings className="h-4 w-4" aria-hidden />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="bottom">Settings</TooltipContent>
        </Tooltip>
      </div>
      <div className="title-bar-end-spacer shrink-0" style={noDrag} />
      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm max-h-[85vh] flex flex-col">
          <DialogTitle className="sr-only">Saved sessions</DialogTitle>
          {actions?.toolId ? (
            <SessionListContent toolId={actions.toolId} onLoad={handleLoadSession} />
          ) : null}
        </DialogContent>
      </Dialog>
    </header>
  );
});

export default TitleBar;
