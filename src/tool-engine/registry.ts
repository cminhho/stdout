import { ToolDefinition, ToolPack, ToolGroup, Edition, ToolMiddleware } from "./types";

class ToolRegistry {
  private packs: ToolPack[] = [];
  private toolMap = new Map<string, ToolDefinition>();
  private pathIndex = new Map<string, string>(); // path → toolId
  private middlewares: ToolMiddleware[] = [];

  registerPack(pack: ToolPack) {
    // Avoid duplicate registration
    if (this.packs.some((p) => p.id === pack.id)) return;

    // Validate tools before registering
    for (const tool of pack.tools) {
      if (this.toolMap.has(tool.id)) {
        console.warn(
          `[ToolEngine] Duplicate tool id "${tool.id}" in pack "${pack.id}" — skipping`
        );
        continue;
      }
      if (this.pathIndex.has(tool.path)) {
        console.warn(
          `[ToolEngine] Duplicate path "${tool.path}" (tool "${tool.id}") conflicts with "${this.pathIndex.get(tool.path)}" — skipping`
        );
        continue;
      }
      this.toolMap.set(tool.id, tool);
      this.pathIndex.set(tool.path, tool.id);
    }

    this.packs.push(pack);

    // Lifecycle hook
    pack.onRegister?.();
  }

  /** Add middleware for tool resolution filtering */
  use(middleware: ToolMiddleware) {
    this.middlewares.push(middleware);
  }

  /** Get all tools available for the given edition (after middleware) */
  getTools(edition: Edition): ToolDefinition[] {
    const raw = Array.from(this.toolMap.values()).filter((t) =>
      t.editions.includes(edition)
    );

    if (this.middlewares.length === 0) return raw;

    return raw.reduce<ToolDefinition[]>((acc, tool) => {
      let result: ToolDefinition | null = tool;
      for (const mw of this.middlewares) {
        if (!result) break;
        result = mw(result, { edition });
      }
      if (result) acc.push(result);
      return acc;
    }, []);
  }

  /** Get tools grouped by category */
  getGroups(edition: Edition): ToolGroup[] {
    const tools = this.getTools(edition);
    const groupMap = new Map<string, ToolDefinition[]>();

    tools.forEach((tool) => {
      const existing = groupMap.get(tool.group) || [];
      existing.push(tool);
      groupMap.set(tool.group, existing);
    });

    return Array.from(groupMap.entries()).map(([label, groupTools]) => ({
      label,
      tools: groupTools,
    }));
  }

  /** Get a single tool by ID */
  getTool(id: string): ToolDefinition | undefined {
    return this.toolMap.get(id);
  }

  /** Get a tool by path */
  getToolByPath(path: string): ToolDefinition | undefined {
    const id = this.pathIndex.get(path);
    return id ? this.toolMap.get(id) : undefined;
  }

  /** Search tools */
  search(query: string, edition: Edition): ToolDefinition[] {
    const q = query.toLowerCase();
    return this.getTools(edition).filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  /** Get all registered packs */
  getPacks(): ToolPack[] {
    return [...this.packs];
  }

  /** Get registry stats */
  getStats() {
    return {
      totalPacks: this.packs.length,
      totalTools: this.toolMap.size,
      totalPaths: this.pathIndex.size,
      middlewareCount: this.middlewares.length,
    };
  }
}

// Singleton instance
export const registry = new ToolRegistry();
