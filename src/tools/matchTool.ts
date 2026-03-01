import type { ToolDefinition } from "@/types/tool";

/**
 * Match a tool by query (label, description, or group). Substring match, case-insensitive.
 * Shared by HomePage and CommandPalette for consistent search behavior.
 */
export function matchTool(query: string, tool: ToolDefinition): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    tool.label.toLowerCase().includes(q) ||
    tool.description.toLowerCase().includes(q) ||
    tool.group.toLowerCase().includes(q)
  );
}
