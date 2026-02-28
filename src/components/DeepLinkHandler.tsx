import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToolEngine } from "@/hooks/useToolEngine";
import { getDeepLinkInput, parseDeepLinkUrl } from "@/utils/deepLink";

const electronAPI = typeof window !== "undefined" ? window.electronAPI : undefined;

/**
 * Subscribes to Electron open-url (stdout://...) and applies deep link:
 * parses URL, sets workspace input for the tool, navigates to tool path.
 * Renders nothing.
 */
export function DeepLinkHandler() {
  const navigate = useNavigate();
  const { setToolState } = useWorkspace();
  const { getToolById } = useToolEngine();

  const handleDeepLink = useCallback(
    (url: string) => {
      const parsed = parseDeepLinkUrl(url);
      if (!parsed) return;
      const { toolId, params } = parsed;
      const tool = getToolById(toolId);
      if (!tool) return;
      const input = getDeepLinkInput(params);
      if (input) setToolState(toolId, { input });
      navigate(tool.path);
    },
    [navigate, setToolState, getToolById]
  );

  useEffect(() => {
    if (!electronAPI?.deepLink?.onOpenUrl) return;
    const unsub = electronAPI.deepLink.onOpenUrl(handleDeepLink);
    return unsub;
  }, [handleDeepLink]);

  return null;
}
