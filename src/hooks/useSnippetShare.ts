import { useCallback, useMemo } from "react";
import type { PerToolState } from "@/types/workspace";
import { downloadSnippetFile, getShareableUrl } from "@/utils/snippetShare";

export interface UseSnippetShareResult {
  shareUrl: string | null;
  downloadSnippet: () => void;
  copyLink: () => Promise<void>;
}

/**
 * Hook for shareable snippets: share URL (or null if too long) and download/copy actions.
 */
export function useSnippetShare(toolId: string, state: PerToolState): UseSnippetShareResult {
  const shareUrl = useMemo(() => getShareableUrl(toolId, state), [toolId, state]);

  const downloadSnippet = useCallback(() => {
    downloadSnippetFile(toolId, state);
  }, [toolId, state]);

  const copyLink = useCallback(async () => {
    if (shareUrl == null) return;
    await navigator.clipboard.writeText(shareUrl);
  }, [shareUrl]);

  return { shareUrl, downloadSnippet, copyLink };
}
