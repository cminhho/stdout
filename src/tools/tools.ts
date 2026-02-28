import { tools } from "./registry";
import type { ToolDefinition, ToolGroup } from "./types";

const pathToTool = new Map<string, ToolDefinition>(tools.map((t) => [t.path, t]));
const idToTool = new Map<string, ToolDefinition>(tools.map((t) => [t.id, t]));

function byGroup(list: ToolDefinition[]): ToolGroup[] {
  const map = new Map<string, ToolDefinition[]>();
  for (const t of list) {
    const g = map.get(t.group) ?? [];
    g.push(t);
    map.set(t.group, g);
  }
  return Array.from(map.entries(), ([label, groupTools]) => ({ label, tools: groupTools }));
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

export function getToolById(id: string): ToolDefinition | undefined {
  return idToTool.get(id);
}
