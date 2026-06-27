/** Share snippet: popover with Copy web link, Copy app link, and Download snippet. */
import { memo, useCallback, useState } from "react";
import { Share2, Globe, AppWindow, Download, Check } from "lucide-react";
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

type CopyTarget = "web" | "app";

const ShareSnippetButton = memo(function ShareSnippetButton({
  toolId,
  state,
  className,
}: ShareSnippetButtonProps) {
  const { webUrl, appUrl, downloadSnippet, copyWebLink, copyAppLink } = useSnippetShare(
    toolId,
    state
  );
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  const handleCopy = useCallback(
    async (target: CopyTarget) => {
      const url = target === "web" ? webUrl : appUrl;
      if (url == null) return;
      await (target === "web" ? copyWebLink() : copyAppLink());
      setCopied(target);
      setTimeout(() => setCopied(null), 1500);
    },
    [webUrl, appUrl, copyWebLink, copyAppLink]
  );

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
      <PopoverContent align="end" className="w-60">
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="justify-start gap-2"
            onClick={() => handleCopy("web")}
            disabled={webUrl == null}
            title={
              webUrl == null
                ? "Link too long; use Download snippet"
                : copied === "web"
                  ? "Copied"
                  : "Open in browser (online tool)"
            }
          >
            {copied === "web" ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Globe className="h-3.5 w-3.5 shrink-0" />
            )}
            {copied === "web" ? "Copied" : "Copy web link"}
          </Button>
          <Button
            type="button"
            size="xs"
            variant="ghost"
            className="justify-start gap-2"
            onClick={() => handleCopy("app")}
            disabled={appUrl == null}
            title={
              appUrl == null
                ? "Link too long; use Download snippet"
                : copied === "app"
                  ? "Copied"
                  : "Open in the desktop app"
            }
          >
            {copied === "app" ? (
              <Check className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <AppWindow className="h-3.5 w-3.5 shrink-0" />
            )}
            {copied === "app" ? "Copied" : "Copy app link"}
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
