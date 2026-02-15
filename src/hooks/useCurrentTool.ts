import { useLocation } from "react-router-dom";
import { useToolEngine } from "./useToolEngine";

/**
 * Returns the current tool's label and description from the registry (public-pack / mca-pack)
 * based on the current route path. Use for ToolLayout so title/description stay in sync with pack.
 */
export const useCurrentTool = () => {
  const location = useLocation();
  const { getToolByPath } = useToolEngine();
  return getToolByPath(location.pathname) ?? null;
};
