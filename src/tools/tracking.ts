/**
 * Tool Usage Tracking Service
 *
 * Tracks tool opens, usage duration, and frequency.
 * Currently persists to localStorage; designed for future migration to a backend DB or analytics (e.g. GA).
 *
 * Privacy: We only store toolId, path, timestamp, duration. We never record or send user content
 * (input/output, pasted JSON, passwords, URLs, etc.). Any future analytics must follow the same rule.
 */

interface ToolUsageEvent {
  toolId: string;
  path: string;
  timestamp: number;
  /** Duration in ms (populated on tool close/switch) */
  duration?: number;
}

interface ToolUsageStats {
  toolId: string;
  path: string;
  totalOpens: number;
  totalDuration: number;
  lastUsed: number;
}

interface TrackingStore {
  events: ToolUsageEvent[];
  stats: Record<string, ToolUsageStats>;
  version: number;
}

const STORAGE_KEY = "stdout-tracking";
const MAX_EVENTS = 500;
const STORE_VERSION = 1;

const emptyStore = (): TrackingStore => ({
  events: [],
  stats: {},
  version: STORE_VERSION,
});

const load = (): TrackingStore => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TrackingStore;
      if (parsed.version === STORE_VERSION) return parsed;
    }
  } catch { /* ignore parse error */ }
  return emptyStore();
};

const save = (store: TrackingStore) => {
  try {
    const toSave =
      store.events.length > MAX_EVENTS
        ? { ...store, events: store.events.slice(-MAX_EVENTS) }
        : store;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore write error */ }
};

class ToolTrackingService {
  private store: TrackingStore;
  private activeSession: { toolId: string; path: string; startedAt: number } | null = null;

  constructor() {
    this.store = load();
  }

  /** Record a tool open event */
  trackOpen(toolId: string, path: string) {
    this.closeActiveSession();

    const now = Date.now();
    this.activeSession = { toolId, path, startedAt: now };

    const events = [...this.store.events, { toolId, path, timestamp: now }];
    const existing = this.store.stats[toolId];
    const stats = {
      ...this.store.stats,
      [toolId]: existing
        ? { ...existing, totalOpens: existing.totalOpens + 1, lastUsed: now }
        : { toolId, path, totalOpens: 1, totalDuration: 0, lastUsed: now },
    };
    this.store = { ...this.store, events, stats };
    save(this.store);
  }

  /** Close active session and record duration */
  closeActiveSession() {
    if (!this.activeSession) return;

    const duration = Date.now() - this.activeSession.startedAt;
    const { toolId } = this.activeSession;

    const events = [...this.store.events];
    const lastIdx = events.map((e, i) => (e.toolId === toolId && !e.duration ? i : -1)).filter((i) => i >= 0).pop();
    if (lastIdx !== undefined) {
      events[lastIdx] = { ...events[lastIdx], duration };
    }
    const nextStats =
      this.store.stats[toolId]
        ? { ...this.store.stats, [toolId]: { ...this.store.stats[toolId], totalDuration: this.store.stats[toolId].totalDuration + duration } }
        : this.store.stats;
    this.store = { ...this.store, events, stats: nextStats };

    this.activeSession = null;
    save(this.store);
  }

  /** Get usage stats for all tools, sorted by frequency */
  getStats(): ToolUsageStats[] {
    return Object.values(this.store.stats).sort((a, b) => b.totalOpens - a.totalOpens);
  }

  /** Get top N most-used tools */
  getTopTools(n = 5): ToolUsageStats[] {
    return this.getStats().slice(0, n);
  }

  /** Get recent events */
  getRecentEvents(n = 20): ToolUsageEvent[] {
    return this.store.events.slice(-n).reverse();
  }

  /** Export all tracking data (for future migration) */
  exportData(): TrackingStore {
    return structuredClone(this.store);
  }

  /** Clear all tracking data */
  clear() {
    this.store = emptyStore();
    this.activeSession = null;
    save(this.store);
  }
}

// Singleton
export const trackingService = new ToolTrackingService();
