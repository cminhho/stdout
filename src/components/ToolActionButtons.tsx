import { Button } from "@/components/ui/button";
import { FileCode, Eraser, Download } from "lucide-react";
import { cn } from "@/utils/cn";
import { downloadAsFile } from "@/utils/download";

/** Shared style for tool bar actions (Sample, Clear, Save, Upload) – matches --text-content across pages. */
export const toolButtonClass = "h-8 text-sm";

const iconClass = "h-3.5 w-3.5 mr-1.5";

export interface SampleButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function SampleButton({ onClick, disabled, className }: SampleButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="toolbar"
      className={cn(toolButtonClass, className)}
      onClick={onClick}
      disabled={disabled}
    >
      <FileCode className={iconClass} />
      Sample
    </Button>
  );
}

export interface ClearButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ClearButton({ onClick, disabled, className }: ClearButtonProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="toolbar"
      className={cn(toolButtonClass, className)}
      onClick={onClick}
      disabled={disabled}
    >
      <Eraser className={iconClass} />
      Clear
    </Button>
  );
}

export type SaveButtonProps = {
  label?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
} & (
  | { content: string | Blob; filename: string; mimeType?: string }
  | { onClick: () => void }
);

export function SaveButton({
  label = "Save",
  title = "Save as file",
  disabled,
  className,
  ...rest
}: SaveButtonProps) {
  const onClick =
    "content" in rest
      ? () => downloadAsFile(rest.content, rest.filename, rest.mimeType)
      : rest.onClick;
  return (
    <Button
      type="button"
      size="sm"
      variant="toolbar"
      className={cn(toolButtonClass, className)}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Download className="h-3 w-3 mr-1" />
      {label}
    </Button>
  );
}
