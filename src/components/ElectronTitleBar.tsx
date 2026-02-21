import React from "react";
import { useLocation } from "react-router-dom";
import { useToolEngine } from "@/hooks/useToolEngine";

/**
 * Custom title bar for Electron (macOS hiddenInset or frameless).
 * - Provides drag region (-webkit-app-region: drag) so the window can be moved.
 * - On macOS with hiddenInset, OS draws traffic lights; we add left padding so content doesn't overlap.
 * - Content below does NOT need margin-top: this bar is just the first block in the layout.
 */
const ElectronTitleBar = () => {
  const location = useLocation();
  const { tools } = useToolEngine();
  const isMac = window.electronAPI?.platform === "darwin";
  const hasWindowControls = !isMac && window.electronAPI?.window;

  const currentTool = tools.find((t) => t.path === location.pathname);
  const title = location.pathname === "/" ? "stdout" : currentTool?.label ?? "stdout";

  return (
    <header
      className="electron-title-bar flex items-center shrink-0 h-10 px-3 gap-3"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* macOS hiddenInset: traffic lights are drawn by OS at ~14,14; leave space so we don't overlap */}
      {isMac && <div className="w-[72px] shrink-0" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties} />}
      {hasWindowControls && (
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
          className={`text-xs font-medium text-foreground truncate ${isMac ? "electron-title-plain" : "title-tab"}`}
        >
          {title}
        </span>
      </div>
      <div className="w-[72px] shrink-0" />
    </header>
  );
};

export default ElectronTitleBar;
