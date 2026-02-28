/** Page-level toolbar: tool name, Save session, Share snippet, Sessions (More), optional Settings. */
import { memo, useCallback, useState } from "react";
import { MoreVertical, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SaveSessionButton from "@/components/common/SaveSessionButton";
import ShareSnippetButton from "@/components/common/ShareSnippetButton";
import SessionListContent from "@/components/common/SessionListContent";
import type { PerToolState } from "@/types/workspace";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

export interface ToolbarProps {
  /** Tool display name (e.g. "JSON Formatter"). */
  toolName?: string;
  /** When set with shareState, show Save session, Share, and Sessions. */
  toolId?: string;
  /** Current tool state for saving session and sharing snippet. */
  shareState?: PerToolState;
  /** Called when user loads a session from the Sessions list. */
  onLoadSession?: (state: PerToolState) => void;
  /** Optional link to settings (e.g. "/settings"). Omit to hide Settings. */
  settingsHref?: string;
  className?: string;
}

const Toolbar = memo(function Toolbar({
  toolName,
  toolId,
  shareState,
  onLoadSession,
  settingsHref = "/settings",
  className,
}: ToolbarProps) {
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const handleLoadSession = useCallback(
    (state: PerToolState) => {
      onLoadSession?.(state);
      setSessionsOpen(false);
    },
    [onLoadSession]
  );

  const showSessionShare =
    toolId != null && toolId !== "" && shareState != null;

  return (
    <>
      <span className="panel-header-label min-w-0 truncate">
        {toolName ?? "Tool"}
      </span>
      <div className="panel-header-actions">
        <div className="toolbar-actions-row flex items-center gap-1">
          {showSessionShare ? (
            <>
              <SaveSessionButton
                toolId={toolId}
                currentState={shareState}
              />
              <ShareSnippetButton
                toolId={toolId}
                state={shareState}
              />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    aria-label="More actions"
                    title="More actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48 p-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setSessionsOpen(true)}
                  >
                    Sessions
                  </Button>
                </PopoverContent>
              </Popover>
            </>
          ) : null}
          {settingsHref ? (
            <Link
              to={settingsHref}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors",
                "h-7 px-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              )}
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </div>

      <Dialog open={sessionsOpen} onOpenChange={setSessionsOpen}>
        <DialogContent className="gap-0 p-0 sm:max-w-sm max-h-[85vh] flex flex-col">
          <DialogTitle className="sr-only">Saved sessions</DialogTitle>
          {toolId ? (
            <SessionListContent toolId={toolId} onLoad={handleLoadSession} />
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
});

export default Toolbar;
