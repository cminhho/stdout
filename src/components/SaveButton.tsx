import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadAsFile } from "@/utils/download";

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
    <Button type="button" size="sm" variant="toolbar" className={className} onClick={onClick} disabled={disabled} title={title}>
      <Download className="h-3.5 w-3.5 mr-1.5" />
      {label}
    </Button>
  );
}
