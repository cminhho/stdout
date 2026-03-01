import type { PerToolState, WorkspaceState } from "@/types/workspace";

const STORAGE_KEY = "stdout-workspace";

/** Max chars per tool input to avoid localStorage quota. */
export const MAX_INPUT_LENGTH = 100_000;

/** Max number of tools to keep in perTool; evict by keeping most recently used. */
export const MAX_TOOLS_STORED = 20;

const defaults: WorkspaceState = {
  lastPath: "",
  perTool: {},
};

function isValidPerToolValue(v: unknown): v is PerToolState {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  if (o.input !== undefined && typeof o.input !== "string") return false;
  if (o.scrollPosition !== undefined && typeof o.scrollPosition !== "number") return false;
  if (o.splitPercent !== undefined && typeof o.splitPercent !== "number") return false;
  return true;
}

function parsePerTool(raw: unknown): WorkspaceState["perTool"] {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return defaults.perTool;
  const out: Record<string, PerToolState> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof k !== "string" || !k.trim()) continue;
    if (!isValidPerToolValue(v)) continue;
    const input =
      typeof v.input === "string"
        ? v.input.slice(0, MAX_INPUT_LENGTH)
        : undefined;
    out[k] = {
      ...(input !== undefined && { input }),
      ...(v.scrollPosition !== undefined && { scrollPosition: v.scrollPosition }),
      ...(v.splitPercent !== undefined && { splitPercent: v.splitPercent }),
    };
  }
  return out;
}

export function loadWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const lastPath =
        typeof parsed.lastPath === "string" ? parsed.lastPath : defaults.lastPath;
      const perTool = parsePerTool(parsed.perTool);
      return { lastPath, perTool };
    }
  } catch { /* invalid */ }
  return defaults;
}

function trimPerTool(perTool: Record<string, PerToolState>): Record<string, PerToolState> {
  const entries = Object.entries(perTool).map(([k, v]) => [
    k,
    {
      ...v,
      input:
        typeof v.input === "string"
          ? v.input.slice(0, MAX_INPUT_LENGTH)
          : v.input,
    },
  ] as const);
  const trimmed =
    entries.length <= MAX_TOOLS_STORED
      ? entries
      : entries.slice(-MAX_TOOLS_STORED);
  return Object.fromEntries(trimmed);
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    const toSave: WorkspaceState = {
      lastPath: state.lastPath,
      perTool: trimPerTool(state.perTool),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* quota or other */ }
}
