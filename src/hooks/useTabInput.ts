/**
 * Tool input state that survives tab switches AND app reloads, per tab instance.
 *
 *  - Content is keyed by the per-tab `tabId` (so two instances of the same tool keep separate input).
 *  - Lazy initializer restores from the tab's stored content; the primary instance (tabId === toolId)
 *    falls back to the legacy/deep-link `workspace.perTool[toolId].input` so existing data + `/open`
 *    deep-links keep working.
 *  - Writes go to TabsContext (debounced, to avoid per-keystroke context churn now that keep-alive
 *    keeps many tabs mounted), flushed on unmount + beforeunload.
 *  - Title-bar Save/Share/Sessions are keyed by `toolId` (per tool) and only the active tab owns them.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useTitleBarActions } from "@/contexts/TitleBarActionsContext";
import { useTabToolContextOptional } from "@/contexts/TabToolContext";
import { useTabs } from "@/contexts/TabsContext";
import { debounce } from "@/utils/debounce";

const PERSIST_DEBOUNCE_MS = 500;

export interface UseTabInputResult {
  input: string;
  setInput: (value: string) => void;
  toolId: string | undefined;
}

export function useTabInput(initial = ""): UseTabInputResult {
  const tool = useCurrentTool();
  const toolId = tool?.id;
  const tabCtx = useTabToolContextOptional();
  const tabId = tabCtx?.tabId ?? toolId; // fall back to toolId when rendered outside a tab
  const isActive = tabCtx?.isActive ?? true;

  const { getToolState } = useWorkspace();
  const { getTabInput, setTabInput } = useTabs();
  const { setTitleBarActions, clearTitleBarActions } = useTitleBarActions();

  const [input, setInputState] = useState<string>(() => {
    if (!tabId) return initial;
    const fromTab = getTabInput(tabId);
    if (fromTab !== undefined) return fromTab;
    // Primary instance: seed from legacy/deep-link workspace content.
    if (toolId && tabId === toolId) return getToolState(toolId).input ?? initial;
    return initial;
  });

  const inputRef = useRef(input);
  inputRef.current = input;
  const tabIdRef = useRef(tabId);
  tabIdRef.current = tabId;

  const persist = useMemo(
    () =>
      debounce(() => {
        if (tabIdRef.current) setTabInput(tabIdRef.current, inputRef.current);
      }, PERSIST_DEBOUNCE_MS),
    [setTabInput]
  );

  const setInput = useCallback(
    (value: string) => {
      setInputState(value);
      persist();
    },
    [persist]
  );

  // Flush the latest input synchronously on unmount (tab close) and before unload (reload/quit).
  useEffect(() => {
    const flush = () => {
      persist.cancel();
      if (tabIdRef.current) setTabInput(tabIdRef.current, inputRef.current);
    };
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [persist, setTabInput]);

  // Only the visible (active) tab owns the title-bar Share action (keyed by toolId).
  useEffect(() => {
    if (!isActive || !toolId) return;
    setTitleBarActions({
      toolId,
      toolName: tool?.label,
      shareState: { input },
    });
    return () => clearTitleBarActions();
  }, [isActive, toolId, tool?.label, input, setTitleBarActions, clearTitleBarActions]);

  return { input, setInput, toolId };
}
