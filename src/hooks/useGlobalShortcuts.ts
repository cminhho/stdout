import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";

import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { getRecentPaths } from "@/tools/recentTools";

/**
 * Registers global keyboard shortcuts: Ctrl/Cmd+K (command palette) and Ctrl+Shift+T (reopen last closed tool).
 * Must be used inside Router and CommandPaletteProvider.
 */
export function useGlobalShortcuts(): void {
  const navigate = useNavigate();
  const location = useLocation();
  const { openCommandPalette, closeCommandPalette } = useCommandPalette();

  const reopenLastClosedTool = useCallback(() => {
    const paths = getRecentPaths();
    const current = location.pathname;
    const prev =
      paths.length >= 2 && paths[0] === current
        ? paths[1]
        : paths.length >= 1
          ? paths[0]
          : null;
    if (prev && prev !== current) {
      closeCommandPalette();
      navigate(prev);
    }
  }, [location.pathname, navigate, closeCommandPalette]);

  useHotkeys(
    "ctrl+k, meta+k",
    (e) => {
      e.preventDefault();
      openCommandPalette();
    },
    { enableOnFormTags: true }
  );

  useHotkeys("ctrl+shift+t", reopenLastClosedTool, { enableOnFormTags: true });
}
