import { useCallback, useMemo } from "react";
import type { PerToolState } from "@/types/workspace";
import { downloadSnippetFile, getAppShareUrl, getWebShareUrl } from "@/utils/snippetShare";

export interface UseSnippetShareResult {
  /** https link that opens the online tool in any browser (null if too long). */
  webUrl: string | null;
  /** stdout:// deep link that opens the installed desktop app (null if too long). */
  appUrl: string | null;
  downloadSnippet: () => void;
  copyWebLink: () => Promise<void>;
  copyAppLink: () => Promise<void>;
}

/**
 * Hook for shareable snippets: web + app share URLs (or null if too long) and download/copy actions.
 */
export function useSnippetShare(toolId: string, state: PerToolState): UseSnippetShareResult {
  const webUrl = useMemo(() => getWebShareUrl(toolId, state), [toolId, state]);
  const appUrl = useMemo(() => getAppShareUrl(toolId, state), [toolId, state]);

  const downloadSnippet = useCallback(() => {
    downloadSnippetFile(toolId, state);
  }, [toolId, state]);

  const copyWebLink = useCallback(async () => {
    if (webUrl == null) return;
    await navigator.clipboard.writeText(webUrl);
  }, [webUrl]);

  const copyAppLink = useCallback(async () => {
    if (appUrl == null) return;
    await navigator.clipboard.writeText(appUrl);
  }, [appUrl]);

  return { webUrl, appUrl, downloadSnippet, copyWebLink, copyAppLink };
}
