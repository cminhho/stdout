import { useMemo } from "react";
import { getTools, getGroups, getToolByPath } from "@/tools";

export const useToolEngine = () => {
  const tools = useMemo(() => getTools(), []);
  const groups = useMemo(() => getGroups(), []);
  return { tools, groups, getToolByPath };
};
