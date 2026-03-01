import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { useSettings } from "@/hooks/useSettings";
import { useToolEngine } from "@/hooks/useToolEngine";
import { recordRecentVisit } from "@/tools/recentTools";
import { trackingService } from "@/tools/tracking";

/**
 * Hook that automatically tracks tool usage and recent visits on route changes.
 * Place once in the app shell (e.g. App.tsx).
 */
export const useToolTracking = () => {
  const location = useLocation();
  const { getToolByPath } = useToolEngine();
  const { addRecentTool } = useSettings();

  useEffect(() => {
    const tool = getToolByPath(location.pathname);
    if (tool) {
      trackingService.trackOpen(tool.id, tool.path);
      recordRecentVisit(tool.path);
      addRecentTool(tool.id);
    }

    return () => {
      trackingService.closeActiveSession();
    };
  }, [location.pathname, getToolByPath, addRecentTool]);
};
