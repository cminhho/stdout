/** Copy button – copies text to clipboard and shows brief “Copied” state. */
import { memo, useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CopyButtonProps {
  text: string;
  /** Button label when not copied; default "Copy". Use e.g. "Copy as Auth header" or "Copy as fetch". */
  label?: string;
  className?: string;
}

const CopyButton = memo(function CopyButton({ text, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <Button
      variant="outline"
      size="xs"
      onClick={handleCopy}
      disabled={copied || !text}
      className={className}
      title={text ? (copied ? "Copied" : label) : undefined}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </Button>
  );
});

export { CopyButton };
export default CopyButton;
