import { memo, useCallback, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSessionManager } from "@/hooks/useSessionManager";
import type { PerToolState } from "@/types/workspace";
import { cn } from "@/utils/cn";

export interface SaveSessionButtonProps {
  toolId: string;
  currentState: PerToolState;
  onSaved?: () => void;
  className?: string;
}

const SaveSessionButton = memo(function SaveSessionButton({
  toolId,
  currentState,
  onSaved,
  className,
}: SaveSessionButtonProps) {
  const { saveSession } = useSessionManager(toolId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleOpen = useCallback(() => {
    setName("");
    setOpen(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    setSaving(true);
    const entry = saveSession(name.trim(), currentState);
    setSaving(false);
    if (entry) {
      setOpen(false);
      onSaved?.();
    }
  }, [name, currentState, saveSession, onSaved]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <>
      <Button
        type="button"
        size="xs"
        variant="outline"
        className={cn(className)}
        aria-label="Save session"
        title="Save session"
        onClick={handleOpen}
      >
        <Save className="h-3.5 w-3.5" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-4 p-4 sm:max-w-sm">
          <DialogTitle className="sr-only">Save session</DialogTitle>
          <div className="grid gap-2">
            <Label htmlFor="session-name">Session name</Label>
            <Input
              id="session-name"
              size="sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. API response draft"
              aria-label="Session name"
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" size="sm" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!name.trim() || saving}
            >
              {saving ? "Saving…" : "Save session"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});

export default SaveSessionButton;
