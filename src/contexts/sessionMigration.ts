import { loadWorkspace } from "@/contexts/workspaceStore";
import { addSession } from "@/contexts/sessionStore";
import type { PerToolState } from "@/types/workspace";

const MIGRATION_FLAG_KEY = "stdout-sessions-migrated";
const PILOT_TOOL_IDS = ["json-formatter", "base64", "jwt-decode"] as const;

function hasUsefulState(state: PerToolState): boolean {
  return (
    (typeof state.input === "string" && state.input.length > 0) ||
    typeof state.scrollPosition === "number" ||
    typeof state.splitPercent === "number"
  );
}

function restoredSessionName(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `Restored session (${mm}/${dd}/${yyyy})`;
}

/**
 * One-time migration: create one session per pilot tool from existing workspace
 * perTool data. Does not modify or delete stdout-workspace.
 */
export function runWorkspaceToSessionsMigration(): void {
  try {
    if (localStorage.getItem(MIGRATION_FLAG_KEY) === "1") return;
    const workspace = loadWorkspace();
    for (const toolId of PILOT_TOOL_IDS) {
      const state = workspace.perTool[toolId];
      if (!state || !hasUsefulState(state)) continue;
      addSession(toolId, restoredSessionName(), state, { migrated: true });
    }
    localStorage.setItem(MIGRATION_FLAG_KEY, "1");
  } catch {
    // Do not set flag so we can retry
  }
}
