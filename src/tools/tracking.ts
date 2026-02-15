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
    // Trim old events to prevent unbounded growth
    if (store.events.length > MAX_EVENTS) {
      store.events = store.events.slice(-MAX_EVENTS);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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
    // Close any active session first
    this.closeActiveSession();

    const now = Date.now();
    this.activeSession = { toolId, path, startedAt: now };

    // Record event
    this.store.events.push({ toolId, path, timestamp: now });

    // Update aggregate stats
    if (!this.store.stats[toolId]) {
      this.store.stats[toolId] = {
        toolId,
        path,
        totalOpens: 0,
        totalDuration: 0,
        lastUsed: now,
      };
    }
    this.store.stats[toolId].totalOpens += 1;
    this.store.stats[toolId].lastUsed = now;

    save(this.store);
  }

  /** Close active session and record duration */
  closeActiveSession() {
    if (!this.activeSession) return;

    const duration = Date.now() - this.activeSession.startedAt;
    const { toolId } = this.activeSession;

    // Update last event with duration
    const lastEvent = [...this.store.events].reverse().find((e) => e.toolId === toolId && !e.duration);
    if (lastEvent) lastEvent.duration = duration;

    // Update aggregate stats
    if (this.store.stats[toolId]) {
      this.store.stats[toolId].totalDuration += duration;
    }

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
