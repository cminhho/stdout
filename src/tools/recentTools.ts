/**
 * Recently visited tools — UI-only list for the Home page.
 *
 * Storage: localStorage key "stdout-recent-tools".
 * Format: JSON array of path strings, most recent first.
 * Max: RECENT_TOOLS_MAX (8). Dedupe on prepend; older entries dropped when over cap.
 *
 * Separate from tracking.ts (analytics) so "recent" semantics and cap are explicit
 * and the list stays lightweight. Recorded on each tool open via useToolTracking.
 */

const STORAGE_KEY = "stdout-recent-tools";

/** Max number of recent tool paths to store and display. */
export const RECENT_TOOLS_MAX = 8;

const load = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every((p) => typeof p === "string")) return parsed;
    }
  } catch { /* ignore */ }
  return [];
};

const save = (paths: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paths));
  } catch { /* ignore */ }
};

/**
 * Record a tool visit: prepend path, dedupe (keep first = most recent), cap at RECENT_TOOLS_MAX.
 */
export function recordRecentVisit(path: string): void {
  const prev = load();
  const next = [path, ...prev.filter((p) => p !== path)].slice(0, RECENT_TOOLS_MAX);
  if (JSON.stringify(next) !== JSON.stringify(prev)) save(next);
}

/**
 * Get recent tool paths, most recent first. Length ≤ RECENT_TOOLS_MAX.
 */
export function getRecentPaths(): string[] {
  return load();
}
