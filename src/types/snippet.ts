import type { PerToolState } from "@/types/workspace";

/**
 * Shareable snippet payload: tool id, state to restore, and metadata.
 * Used for .stdout.json files and stdout:// URLs with ?snippet=...
 */
export type SnippetPayload = {
  id: string;
  toolId: string;
  state: PerToolState;
  createdAt: number;
};
