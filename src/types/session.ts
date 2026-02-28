import type { PerToolState } from "@/types/workspace";

/** Single saved session for a tool. */
export interface SessionEntry {
  id: string;
  name: string;
  state: PerToolState;
  createdAt: number;
  /** True when created from workspace migration; optional for one-time auto-load. */
  migrated?: boolean;
}

/** Sessions keyed by tool id. Max 20 entries per tool. */
export type SessionsByTool = Record<string, SessionEntry[]>;
