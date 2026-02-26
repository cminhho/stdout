/** Copy button – copies text to clipboard and shows brief “Copied” state. */
import { memo, useCallback, useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton = memo(function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);

  return (
    <Button variant="outline" size="xs" onClick={handleCopy} disabled={copied} className={className}>
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
});

export { CopyButton };
export default CopyButton;
