import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { PerToolState } from "@/types/workspace";

export interface TitleBarActions {
  toolId?: string;
  toolName?: string;
  shareState?: PerToolState;
  onLoadSession?: (state: PerToolState) => void;
}

interface TitleBarActionsContextValue {
  actions: TitleBarActions | null;
  setTitleBarActions: (actions: TitleBarActions | null) => void;
  clearTitleBarActions: () => void;
}

const TitleBarActionsContext = createContext<TitleBarActionsContextValue | null>(
  null
);

export function TitleBarActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<TitleBarActions | null>(null);
  const setTitleBarActions = useCallback((value: TitleBarActions | null) => {
    setActions(value);
  }, []);
  const clearTitleBarActions = useCallback(() => setActions(null), []);

  return (
    <TitleBarActionsContext.Provider
      value={{
        actions,
        setTitleBarActions,
        clearTitleBarActions,
      }}
    >
      {children}
    </TitleBarActionsContext.Provider>
  );
}

export function useTitleBarActions(): TitleBarActionsContextValue {
  const ctx = useContext(TitleBarActionsContext);
  if (!ctx) {
    throw new Error(
      "useTitleBarActions must be used within TitleBarActionsProvider"
    );
  }
  return ctx;
}

export function useTitleBarActionsOptional(): TitleBarActionsContextValue | null {
  return useContext(TitleBarActionsContext);
}
