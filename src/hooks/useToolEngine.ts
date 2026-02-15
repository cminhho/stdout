import { useMemo } from "react";
import { getTools, getGroups, getToolByPath } from "@/tool-engine";
import type { ToolDefinition, ToolGroup } from "@/tool-engine/types";

export const useToolEngine = () => {
  const tools = useMemo(() => getTools(), []);
  const groups = useMemo(() => getGroups(), []);
  return { tools, groups, getToolByPath };
};

export type { ToolDefinition, ToolGroup };
