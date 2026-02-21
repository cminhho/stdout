import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadAsFile } from "@/utils/download";

export type SaveButtonProps = {
  label?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
} & (
  | { content: string | Blob; filename: string; mimeType?: string }
  | { onClick: () => void }
);

export function SaveButton({
  label = "Save",
  title = "Save as file",
  disabled,
  className,
  variant = "outline",
  ...rest
}: SaveButtonProps) {
  const onClick =
    "content" in rest
      ? () => downloadAsFile(rest.content, rest.filename, rest.mimeType)
      : rest.onClick;
  return (
    <Button type="button" size="xs" variant={variant} className={className} onClick={onClick} disabled={disabled} title={title}>
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
