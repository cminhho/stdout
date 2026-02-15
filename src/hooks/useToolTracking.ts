import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useToolEngine } from "./useToolEngine";
import { trackingService } from "@/tools/tracking";

/**
 * Hook that automatically tracks tool usage based on route changes.
 * Place once in the app shell (e.g. App.tsx).
 */
export const useToolTracking = () => {
  const location = useLocation();
  const { getToolByPath } = useToolEngine();

  useEffect(() => {
    const tool = getToolByPath(location.pathname);
    if (tool) {
      trackingService.trackOpen(tool.id, tool.path);
    }

    return () => {
      trackingService.closeActiveSession();
    };
  }, [location.pathname, getToolByPath]);
};
