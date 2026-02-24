import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToolEngine } from "./useToolEngine";
import { trackingService } from "@/tools/tracking";
import { recordRecentVisit } from "@/tools/recentTools";

/**
 * Hook that automatically tracks tool usage and recent visits on route changes.
 * Place once in the app shell (e.g. App.tsx).
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
