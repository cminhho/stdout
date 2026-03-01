import { useCallback, useState, useEffect } from "react";
import {
  addSession,
  deleteSession as deleteSessionStorage,
  getSessionsForTool,
  getSession,
} from "@/contexts/sessionStore";
import type { PerToolState } from "@/types/workspace";
import type { SessionEntry } from "@/types/session";

export interface UseSessionManagerResult {
  sessions: SessionEntry[];
  refresh: () => void;
  saveSession: (name: string, state: PerToolState) => SessionEntry | null;
  getSessionById: (id: string) => SessionEntry | null;
  deleteSession: (id: string) => boolean;
}

export function useSessionManager(toolId: string): UseSessionManagerResult {
  const [sessions, setSessions] = useState<SessionEntry[]>(() =>
    toolId ? getSessionsForTool(toolId) : []
  );

  const refresh = useCallback(() => {
    if (toolId) setSessions(getSessionsForTool(toolId));
  }, [toolId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveSession = useCallback(
    (name: string, state: PerToolState): SessionEntry | null => {
      if (!toolId) return null;
      const entry = addSession(toolId, name, state);
      if (entry) refresh();
      return entry;
    },
    [toolId, refresh]
  );

  const getSessionById = useCallback(
    (id: string): SessionEntry | null => {
      if (!toolId) return null;
      return getSession(toolId, id);
    },
    [toolId]
  );

  const deleteSession = useCallback(
    (id: string): boolean => {
      if (!toolId) return false;
      const ok = deleteSessionStorage(toolId, id);
      if (ok) refresh();
      return ok;
    },
    [toolId, refresh]
  );

  return {
    sessions,
    refresh,
    saveSession,
    getSessionById,
    deleteSession,
  };
}
