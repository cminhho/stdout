import { memo } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSessionManager } from "@/hooks/useSessionManager";
import type { PerToolState } from "@/types/workspace";
import SessionListContent from "@/components/common/SessionListContent";
import { cn } from "@/utils/cn";

export interface SavedSessionsPopoverProps {
  toolId: string;
  onLoad: (state: PerToolState) => void;
  className?: string;
}

const SavedSessionsPopover = memo(function SavedSessionsPopover({
  toolId,
  onLoad,
  className,
}: SavedSessionsPopoverProps) {
  const { sessions } = useSessionManager(toolId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="xs"
          variant="outline"
          className={cn(className)}
          aria-label="Saved sessions"
          title="Saved sessions"
          disabled={sessions.length === 0}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          {sessions.length > 0 && (
            <span className="ml-1 text-xs tabular-nums">{sessions.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-0">
        <SessionListContent toolId={toolId} onLoad={onLoad} />
      </PopoverContent>
    </Popover>
  );
});

export default SavedSessionsPopover;
