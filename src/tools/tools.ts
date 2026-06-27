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

/** Tool groups where opening multiple instances (tabs) of the same tool is useful. */
const MULTI_INSTANCE_GROUPS = new Set<string>([
  "Formatters",
  "Converters",
  "Encode & Crypto",
  "Validators",
]);

/** Tools allowed to have multiple instances despite not being in a multi-instance group (e.g. diff). */
const MULTI_INSTANCE_TOOL_IDS = new Set<string>(["text-diff"]);

/**
 * Whether a tool may be opened in multiple tabs at once. Data-processing tools (format/convert/
 * encode/validate/diff) benefit; generators, reference, and calculators do not.
 */
export function toolAllowsMultiInstance(toolId: string): boolean {
  const tool = idToTool.get(toolId);
  if (!tool) return false;
  return MULTI_INSTANCE_GROUPS.has(tool.group) || MULTI_INSTANCE_TOOL_IDS.has(tool.id);
}
