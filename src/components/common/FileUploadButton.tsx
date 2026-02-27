/** File upload button – accepts file(s) and passes content via onText or onSelect. */
import { memo, useCallback, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { readFileAsText } from "@/utils/fileUpload";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

export type FileUploadButtonProps = {
  accept: string;
  children?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  multiple?: boolean;
  variant?: ButtonVariant;
} & (
  | { onText: (text: string) => void; onSelect?: never }
  | { onSelect: (file: File) => void | Promise<void>; onText?: never }
);


/**
 * Generic file upload. Use onText for text content (component reads UTF-8); use onSelect when you need the File (e.g. images).
 */
const FileUploadButton = memo(function FileUploadButton({
  accept,
  onSelect,
  onText,
  children,
  className,
  buttonClassName,
  disabled = false,
  multiple = false,
  variant = "outline",
}: FileUploadButtonProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const handleChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setLoading(true);
      try {
        if (onText) {
          const text = await readFileAsText(file);
          onText(text);
        } else if (onSelect) {
          await onSelect(file);
        }
      } catch {
        if (onText) onText("");
      } finally {
        e.target.value = "";
        setLoading(false);
      }
    },
    [onText, onSelect]
  );

  const isDisabled = disabled || loading;

  return (
    <span className={cn("inline-flex", className)}>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
        multiple={multiple}
        disabled={isDisabled}
        aria-hidden
      />
      <label htmlFor={id} className={isDisabled ? "pointer-events-none opacity-50" : "cursor-pointer"}>
        {children !== undefined ? (
          children
        ) : (
          <Button
            type="button"
            size="xs"
            variant={variant}
            className={buttonClassName}
            disabled={isDisabled}
            isLoading={loading}
            asChild
          >
            <span className="file-upload-button__inner inline-flex items-center justify-center">
              <Upload className="h-3.5 w-3.5" />
              Upload
            </span>
          </Button>
        )}
      </label>
    </span>
  );
});

export default FileUploadButton;
