import React from "react";
import { useLocation } from "react-router-dom";
import { useToolEngine } from "@/hooks/useToolEngine";

/**
 * Title bar for frameless / custom-window desktop apps.
 * - Drag region so the window can be moved.
 * - When the OS draws window controls in the title bar (e.g. traffic lights), we reserve space.
 * - Otherwise we render in-window close/minimize/maximize controls.
 */
const WindowTitleBar = () => {
  const location = useLocation();
  const { tools } = useToolEngine();
  const hasSystemTitleBarControls = window.electronAPI?.platform === "darwin";
  const hasWindowAPI = !!window.electronAPI?.window;

  const currentTool = tools.find((t) => t.path === location.pathname);
  const title = location.pathname === "/" ? "stdout" : currentTool?.label ?? "stdout";

  return (
    <header
      className="desktop-title-bar flex items-center shrink-0 h-10 px-3 gap-3"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
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
