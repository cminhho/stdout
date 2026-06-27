import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useToolEngine } from "@/hooks/useToolEngine";
import { recordRecentVisit } from "@/tools/recentTools";
import { trackingService } from "@/tools/tracking";

/**
 * Hook that tracks tool-open sessions and records the last-visited path (used by the
 * "reopen last closed tool" shortcut). Place once in the app shell (e.g. App.tsx).
 */
export const useToolTracking = () => {
  const location = useLocation();
  const { getToolByPath } = useToolEngine();

  useEffect(() => {
    const tool = getToolByPath(location.pathname);
    if (tool) {
      trackingService.trackOpen(tool.id, tool.path);
      recordRecentVisit(tool.path);
    }

    return () => {
      trackingService.closeActiveSession();
    };
  }, [location.pathname, getToolByPath]);
};
