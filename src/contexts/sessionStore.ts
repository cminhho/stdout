import { MAX_INPUT_LENGTH } from "@/contexts/workspaceStore";
import type { PerToolState } from "@/types/workspace";
import type { SessionEntry, SessionsByTool } from "@/types/session";

const STORAGE_KEY = "stdout-sessions";
const MAX_SESSIONS_PER_TOOL = 20;

const defaults: SessionsByTool = {};

function sanitizeState(state: PerToolState): PerToolState {
  const out: PerToolState = {};
  if (typeof state.input === "string") {
    out.input = state.input.slice(0, MAX_INPUT_LENGTH);
  }
  if (typeof state.scrollPosition === "number") {
    out.scrollPosition = state.scrollPosition;
  }
  if (typeof state.splitPercent === "number") {
    out.splitPercent = state.splitPercent;
  }
  return out;
}

function parseSessionsByTool(raw: unknown): SessionsByTool {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return defaults;
  const out: SessionsByTool = {};
  for (const [toolId, arr] of Object.entries(raw)) {
    if (typeof toolId !== "string" || !toolId.trim()) continue;
    if (!Array.isArray(arr)) continue;
    const entries: SessionEntry[] = [];
    for (const item of arr) {
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      if (typeof o.id !== "string" || typeof o.name !== "string") continue;
      if (typeof o.state !== "object" || o.state === null) continue;
      const state = sanitizeState(o.state as PerToolState);
      const createdAt = typeof o.createdAt === "number" ? o.createdAt : Date.now();
      entries.push({
        id: o.id,
        name: o.name,
        state,
        createdAt,
        ...(o.migrated === true && { migrated: true }),
      });
    }
    if (entries.length > 0) {
      out[toolId] = entries.sort((a, b) => a.createdAt - b.createdAt);
    }
  }
  return out;
}

export function loadSessions(): SessionsByTool {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return parseSessionsByTool(JSON.parse(raw) as unknown);
  } catch { /* invalid */ }
  return defaults;
}

function trimToolSessions(entries: SessionEntry[]): SessionEntry[] {
  if (entries.length <= MAX_SESSIONS_PER_TOOL) return entries;
  return [...entries]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_SESSIONS_PER_TOOL)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function saveSessions(data: SessionsByTool): boolean {
  try {
    const toSave: SessionsByTool = {};
    for (const [toolId, entries] of Object.entries(data)) {
      if (entries.length > 0) {
        toSave[toolId] = trimToolSessions(entries);
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch {
    return false;
  }
}

export function getSessionsForTool(toolId: string): SessionEntry[] {
  const all = loadSessions();
  return all[toolId] ?? [];
}

export function addSession(
  toolId: string,
  name: string,
  state: PerToolState,
  options?: { migrated?: boolean }
): SessionEntry | null {
  const all = loadSessions();
  const list = all[toolId] ?? [];
  const entry: SessionEntry = {
    id: crypto.randomUUID(),
    name: name.trim() || "Unnamed session",
    state: sanitizeState(state),
    createdAt: Date.now(),
    ...(options?.migrated === true && { migrated: true }),
  };
  const next = trimToolSessions([...list, entry]);
  const nextAll = { ...all, [toolId]: next };
  return saveSessions(nextAll) ? entry : null;
}

export function deleteSession(toolId: string, sessionId: string): boolean {
  const all = loadSessions();
  const list = all[toolId] ?? [];
  const filtered = list.filter((s) => s.id !== sessionId);
  if (filtered.length === list.length) return false;
  const nextAll = { ...all };
  if (filtered.length > 0) {
    nextAll[toolId] = filtered;
  } else {
    delete nextAll[toolId];
  }
  return saveSessions(nextAll);
}

export function getSession(toolId: string, sessionId: string): SessionEntry | null {
  const list = getSessionsForTool(toolId);
  return list.find((s) => s.id === sessionId) ?? null;
}

/** Returns tool ids that have at least one session. */
export function getToolIdsWithSessions(): string[] {
  const all = loadSessions();
  return Object.keys(all).filter((id) => (all[id]?.length ?? 0) > 0);
}
