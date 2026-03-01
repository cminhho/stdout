import { useCallback, useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { PrefSection } from "@/components/settings";
import { useToolEngine } from "@/hooks/useToolEngine";
import { loadSessions, deleteSession as deleteSessionStorage } from "@/contexts/sessionStore";
import type { SessionEntry } from "@/types/session";

function formatSessionDate(createdAt: number): string {
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SettingsSessionsPanel = () => {
  const { getToolById } = useToolEngine();
  const [sessionsByTool, setSessionsByTool] = useState<Record<string, SessionEntry[]>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ toolId: string; session: SessionEntry } | null>(null);

  const refresh = useCallback(() => {
    setSessionsByTool(loadSessions());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleDeleteClick = useCallback((toolId: string, session: SessionEntry) => {
    setConfirmDelete({ toolId, session });
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete) {
      deleteSessionStorage(confirmDelete.toolId, confirmDelete.session.id);
      setConfirmDelete(null);
      refresh();
    }
  }, [confirmDelete, refresh]);

  const toolIds = Object.keys(sessionsByTool).filter(
    (id) => (sessionsByTool[id]?.length ?? 0) > 0
  );
  const totalSessions = toolIds.reduce((sum, id) => sum + (sessionsByTool[id]?.length ?? 0), 0);

  return (
    <div
      id="settings-sessions"
      role="tabpanel"
      aria-labelledby="tab-sessions"
      className="settings-panel"
    >
      <PrefSection heading="Saved sessions" headingId="settings-sessions-heading">
        <p className="settings-body-text" aria-live="polite">
          {totalSessions === 0
            ? "No saved sessions. Save sessions from JSON Formatter, Base64, or JWT Debugger to see them here."
            : `${totalSessions} session${totalSessions === 1 ? "" : "s"} across ${toolIds.length} tool${toolIds.length === 1 ? "" : "s"}.`}
        </p>

        {toolIds.length > 0 && (
          <div className="mt-4 space-y-4">
            {toolIds.map((toolId) => {
              const tool = getToolById(toolId);
              const label = tool?.label ?? toolId;
              const sessions = sessionsByTool[toolId] ?? [];
              return (
                <div key={toolId} className="rounded-lg border border-border bg-muted/30 p-3">
                  <h3 className="mb-2 text-sm font-medium text-foreground">{label}</h3>
                  <ul className="space-y-2">
                    {sessions.map((session) => (
                      <li
                        key={session.id}
                        className="flex items-center justify-between gap-2 rounded border border-border/60 bg-background px-3 py-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium">{session.name}</span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {formatSessionDate(session.createdAt)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="ghost"
                          aria-label={`Delete ${session.name}`}
                          onClick={() => handleDeleteClick(toolId, session)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </PrefSection>

      <Dialog open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="gap-4 p-4 sm:max-w-sm">
          {confirmDelete && (
            <>
              <DialogTitle className="sr-only">Delete session</DialogTitle>
              <p className="text-sm text-foreground">
                Delete session &quot;{confirmDelete.session.name}&quot;? This cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" size="sm" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirmDelete}
                >
                  Delete session
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsSessionsPanel;
