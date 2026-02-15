import { tools as publicTools } from "@/tool-packs/public-pack";
import type { ToolDefinition, ToolGroup } from "./types";

const tools: ToolDefinition[] = publicTools;
const pathToTool = new Map<string, ToolDefinition>();
for (const t of tools) pathToTool.set(t.path, t);

function byGroup(list: ToolDefinition[]): ToolGroup[] {
  const map = new Map<string, ToolDefinition[]>();
  for (const t of list) {
    const g = map.get(t.group) ?? [];
    g.push(t);
    map.set(t.group, g);
  }
  return Array.from(map.entries(), ([label, tools]) => ({ label, tools }));
}

export function getTools(): ToolDefinition[] {
  return tools;
}

export function getGroups(): ToolGroup[] {
  return byGroup(tools);
}

export function getToolByPath(path: string): ToolDefinition | undefined {
  return pathToTool.get(path);
}
