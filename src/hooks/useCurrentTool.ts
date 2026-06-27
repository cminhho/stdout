import { useLocation } from "react-router-dom";

import { useToolEngine } from "@/hooks/useToolEngine";
import { useTabToolContextOptional } from "@/contexts/TabToolContext";

/**
 * Returns the current tool's definition (label, description, etc.).
 *
 * Inside a keep-alive tab, all open tabs share one URL, so prefer the per-tab identity
 * (TabToolContext). Outside a tab (Home/Settings/deep-link/legacy), fall back to resolving
 * the tool from the current route path.
 */
export const useCurrentTool = () => {
  const tabTool = useTabToolContextOptional();
  const location = useLocation();
  const { getToolByPath, getToolById } = useToolEngine();
  if (tabTool) return getToolById(tabTool.toolId) ?? null;
  return getToolByPath(location.pathname) ?? null;
};
