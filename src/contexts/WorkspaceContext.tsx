import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  loadWorkspace,
  saveWorkspace,
} from "@/contexts/workspaceStore";
import { debounce } from "@/utils/debounce";
import type { PerToolState, WorkspaceState } from "@/types/workspace";

export type { PerToolState, WorkspaceState };

export interface WorkspaceContextType extends WorkspaceState {
  setLastPath: (path: string) => void;
  setToolState: (toolId: string, partial: Partial<PerToolState>) => void;
  getToolState: (toolId: string) => PerToolState;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

const PERSIST_DEBOUNCE_MS = 1000;

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkspaceState>(loadWorkspace);

  const setLastPath = useCallback((path: string) => {
    setState((prev) => (prev.lastPath === path ? prev : { ...prev, lastPath: path }));
  }, []);

  const setToolState = useCallback((toolId: string, partial: Partial<PerToolState>) => {
    if (!toolId.trim()) return;
    setState((prev) => ({
      ...prev,
      perTool: {
        ...prev.perTool,
        [toolId]: { ...prev.perTool[toolId], ...partial },
      },
    }));
  }, []);

  const getToolState = useCallback(
    (toolId: string): PerToolState => state.perTool[toolId] ?? {},
    [state.perTool]
  );

  useEffect(() => {
    const debouncedSave = debounce(() => saveWorkspace(state), PERSIST_DEBOUNCE_MS);
    debouncedSave();
    const onBeforeUnload = () => {
      debouncedSave.cancel();
      saveWorkspace(state);
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      debouncedSave.cancel();
      window.removeEventListener("beforeunload", onBeforeUnload);
      saveWorkspace(state);
    };
  }, [state]);

  const value = useMemo<WorkspaceContextType>(
    () => ({
      ...state,
      setLastPath,
      setToolState,
      getToolState,
    }),
    [state, setLastPath, setToolState, getToolState]
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace(): WorkspaceContextType {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}

export function useWorkspaceRestore(toolId: string): PerToolState {
  const { getToolState } = useWorkspace();
  return useMemo(() => getToolState(toolId), [getToolState, toolId]);
}

export function useWorkspacePersist(
  toolId: string,
  partial: Partial<PerToolState>
): void {
  const { setToolState } = useWorkspace();
  useEffect(() => {
    if (!toolId.trim()) return;
    setToolState(toolId, partial);
  }, [toolId, setToolState, partial.input, partial.scrollPosition, partial.splitPercent]);
}

export function useLastPath(): { lastPath: string; setLastPath: (path: string) => void } {
  const { lastPath, setLastPath } = useWorkspace();
  return { lastPath, setLastPath };
}
