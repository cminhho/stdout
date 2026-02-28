/** Share snippet: popover with Copy link and Download snippet. */
import { memo, useCallback, useState } from "react";
import { Share2, Link, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSnippetShare } from "@/hooks/useSnippetShare";
import type { PerToolState } from "@/types/workspace";
import { cn } from "@/utils/cn";

export interface ShareSnippetButtonProps {
  toolId: string;
  state: PerToolState;
  className?: string;
}

const ShareSnippetButton = memo(function ShareSnippetButton({
  toolId,
  state,
  className,
}: ShareSnippetButtonProps) {
  const { shareUrl, downloadSnippet, copyLink } = useSnippetShare(toolId, state);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    if (shareUrl == null) return;
    await copyLink();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [shareUrl, copyLink]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="xs"
          variant="outline"
          className={cn(className)}
          aria-label="Share snippet"
          title="Share snippet"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56">
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="justify-start gap-2"
            onClick={handleCopyLink}
            disabled={shareUrl == null}
            title={
              shareUrl == null
                ? "Link too long; use Download snippet"
                : copied
                  ? "Copied"
                  : "Copy link"
            }
          >
            <Link className="h-3.5 w-3.5 shrink-0" />
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="justify-start gap-2"
            onClick={downloadSnippet}
          >
            <Download className="h-3.5 w-3.5 shrink-0" />
            Download snippet
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default ShareSnippetButton;
