/** Reusable session list with load/delete confirm dialogs. Used in SavedSessionsPopover and Toolbar Sessions dialog. */
import { memo, useCallback, useState } from "react";
import { FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useSessionManager } from "@/hooks/useSessionManager";
import type { PerToolState } from "@/types/workspace";
import type { SessionEntry } from "@/types/session";
import { cn } from "@/utils/cn";

function formatSessionDate(createdAt: number): string {
  const d = new Date(createdAt);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export interface SessionListContentProps {
  toolId: string;
  onLoad: (state: PerToolState) => void;
  className?: string;
}

type ConfirmMode = "load" | "delete" | null;

const SessionListContent = memo(function SessionListContent({
  toolId,
  onLoad,
  className,
}: SessionListContentProps) {
  const { sessions, deleteSession } = useSessionManager(toolId);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>(null);
  const [confirmSession, setConfirmSession] = useState<SessionEntry | null>(null);

  const handleLoadClick = useCallback((session: SessionEntry) => {
    setConfirmSession(session);
    setConfirmMode("load");
  }, []);

  const handleDeleteClick = useCallback((session: SessionEntry) => {
    setConfirmSession(session);
    setConfirmMode("delete");
  }, []);

  const handleConfirmLoad = useCallback(() => {
    if (confirmSession && confirmMode === "load") {
      onLoad(confirmSession.state);
      setConfirmMode(null);
      setConfirmSession(null);
    }
  }, [confirmSession, confirmMode, onLoad]);

  const handleConfirmDelete = useCallback(() => {
    if (confirmSession && confirmMode === "delete") {
      deleteSession(confirmSession.id);
      setConfirmMode(null);
      setConfirmSession(null);
    }
  }, [confirmSession, confirmMode, deleteSession]);

  const handleCancelConfirm = useCallback(() => {
    setConfirmMode(null);
    setConfirmSession(null);
  }, []);

  return (
    <>
      <div className={cn("border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground")}>
        Saved sessions
      </div>
      <ul className="max-h-64 overflow-auto py-1">
        {sessions.length === 0 ? (
          <li className="px-3 py-4 text-center text-xs text-muted-foreground">
            No sessions saved yet.
          </li>
        ) : (
          sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{session.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatSessionDate(session.createdAt)}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Load ${session.name}`}
                  title="Load session"
                  onClick={() => handleLoadClick(session)}
                >
                  <FolderOpen className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-label={`Delete ${session.name}`}
                  title="Delete session"
                  onClick={() => handleDeleteClick(session)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>

      <Dialog open={confirmMode !== null} onOpenChange={(open) => !open && handleCancelConfirm()}>
        <DialogContent className="gap-4 p-4 sm:max-w-sm">
          {confirmMode === "load" && confirmSession && (
            <>
              <DialogTitle className="sr-only">Load session</DialogTitle>
              <p className="text-sm text-foreground">
                Load &quot;{confirmSession.name}&quot;? Current state will be replaced.
              </p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" size="sm" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="button" size="sm" onClick={handleConfirmLoad}>
                  Load session
                </Button>
              </div>
            </>
          )}
          {confirmMode === "delete" && confirmSession && (
            <>
              <DialogTitle className="sr-only">Delete session</DialogTitle>
              <p className="text-sm text-foreground">
                Delete session &quot;{confirmSession.name}&quot;? This cannot be undone.
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
    </>
  );
});

export default SessionListContent;
