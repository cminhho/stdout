/** Save button – downloads content as file or triggers custom onClick. */
import { memo, useCallback } from "react";
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

const SaveButton = memo(function SaveButton({
  label = "Save",
  title = "Save as file",
  disabled,
  className,
  variant = "outline",
  ...rest
}: SaveButtonProps) {
  const isContent = "content" in rest;
  const content = isContent ? rest.content : undefined;
  const filename = isContent ? rest.filename : undefined;
  const mimeType = isContent ? rest.mimeType : undefined;
  const customOnClick = !isContent ? rest.onClick : undefined;
  const downloadOnClick = useCallback(
    () => content !== undefined && filename !== undefined && downloadAsFile(content, filename, mimeType),
    [content, filename, mimeType]
  );
  const onClick = isContent ? downloadOnClick : customOnClick!;
  return (
    <Button type="button" size="xs" variant={variant} className={className} onClick={onClick} disabled={disabled} title={title}>
      <Download className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
});

export { SaveButton };
