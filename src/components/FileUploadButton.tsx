import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { cn } from "@/utils/cn";
import { toolButtonClass } from "@/components/ToolActionButtons";
import { readFileAsText } from "@/utils/fileUpload";

export type FileUploadButtonProps = {
  accept: string;
  children?: React.ReactNode;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  multiple?: boolean;
} & (
  | { onText: (text: string) => void; onSelect?: never }
  | { onSelect: (file: File) => void | Promise<void>; onText?: never }
);


/**
 * Generic file upload. Use onText for text content (component reads UTF-8); use onSelect when you need the File (e.g. images).
 */
const FileUploadButton = ({
  accept,
  onSelect,
  onText,
  children,
  className,
  buttonClassName,
  disabled = false,
  multiple = false,
}: FileUploadButtonProps) => {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

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
            size="sm"
            variant="toolbar"
            className={cn(toolButtonClass, buttonClassName)}
            disabled={isDisabled}
            isLoading={loading}
            asChild
          >
            <span>
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </span>
          </Button>
        )}
      </label>
    </span>
  );
};

export default FileUploadButton;
