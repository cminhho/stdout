import { useMemo } from "react";
import { registry, getEdition } from "@/tool-engine";
import { publicPack } from "@/tool-packs/public-pack";
import { mcaPack } from "@/tool-packs/mca-pack";
import type { ToolDefinition, ToolGroup, Edition } from "@/tool-engine/types";

// Register packs on module load
registry.registerPack(publicPack);
registry.registerPack(mcaPack);

export const useToolEngine = () => {
  const edition = getEdition();

  const tools = useMemo(() => registry.getTools(edition), [edition]);
  const groups = useMemo(() => registry.getGroups(edition), [edition]);

  const search = (query: string) => registry.search(query, edition);
  const getToolByPath = (path: string) => registry.getToolByPath(path);

  return {
    edition,
    tools,
    groups,
    search,
    getToolByPath,
    registry,
  };
};

export type { ToolDefinition, ToolGroup, Edition };
