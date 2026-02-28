/**
 * Workspace state for persistence: last path and per-tool state.
 * Single-route app: no "open tools" array; we restore last path and per-tool data.
 */

export type PerToolState = {
  /** Tool input (e.g. editor content). Capped at save time to avoid quota. */
  input?: string;
  /** Main content scroll position. */
  scrollPosition?: number;
  /** Two-panel split percent (input pane). */
  splitPercent?: number;
};

export type WorkspaceState = {
  /** Path to restore on next load; "" or "/" = do not restore. */
  lastPath: string;
  /** Per-tool state keyed by tool id. */
  perTool: Record<string, PerToolState>;
};
