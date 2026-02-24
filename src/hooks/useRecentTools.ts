import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useToolEngine } from "@/hooks/useToolEngine";
import { useSettings } from "@/hooks/useSettings";
import { getRecentPaths } from "@/tools/recentTools";
import type { ToolDefinition } from "@/tools/types";

/**
 * Returns tools recently visited (most recent first), limited to visible tools.
 * Source: localStorage "stdout-recent-tools" (see recentTools.ts), max RECENT_TOOLS_MAX.
 * Recomputes when location or visibility changes so returning to Home shows fresh list.
 */
export function useRecentTools(): ToolDefinition[] {
  const location = useLocation();
  const { getToolByPath } = useToolEngine();
  const { isToolVisible } = useSettings();

  return useMemo(() => {
    const paths = getRecentPaths();
    const tools: ToolDefinition[] = [];
    for (const path of paths) {
      const tool = getToolByPath(path);
      if (tool && isToolVisible(path)) tools.push(tool);
    }
    return tools;
  }, [location.pathname, getToolByPath, isToolVisible]);
}
