import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Theme = "dark" | "light" | "system";
export type SidebarMode = "grouped" | "flat";

interface SettingsState {
  theme: Theme;
  sidebarMode: SidebarMode;
  sidebarCollapsed: boolean;
  hiddenTools: string[];
}

interface SettingsContextType extends SettingsState {
  setTheme: (t: Theme) => void;
  setSidebarMode: (m: SidebarMode) => void;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  toggleTool: (path: string) => void;
  setAllToolsVisible: () => void;
  isToolVisible: (path: string) => boolean;
}

const STORAGE_KEY = "stdout-settings";

const defaults: SettingsState = {
  theme: "light",
  sidebarMode: "grouped",
  sidebarCollapsed: false,
  hiddenTools: [],
};

const load = (): SettingsState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      return {
        theme: parsed.theme ?? defaults.theme,
        sidebarMode: parsed.sidebarMode ?? defaults.sidebarMode,
        sidebarCollapsed: parsed.sidebarCollapsed ?? defaults.sidebarCollapsed,
        hiddenTools: Array.isArray(parsed.hiddenTools) ? parsed.hiddenTools : defaults.hiddenTools,
      };
    }
  } catch {}
  return defaults;
};

const save = (s: SettingsState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SettingsState>(load);

  useEffect(() => {
    save(state);
  }, [state]);

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    };

    if (state.theme === "dark") {
      applyTheme(true);
    } else if (state.theme === "light") {
      applyTheme(false);
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches);
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [state.theme]);

  const setTheme = (theme: Theme) => setState((s) => ({ ...s, theme }));
  const setSidebarMode = (sidebarMode: SidebarMode) => setState((s) => ({ ...s, sidebarMode }));
  const setSidebarCollapsed = (sidebarCollapsed: boolean) => setState((s) => ({ ...s, sidebarCollapsed }));
  const toggleSidebar = () => setState((s) => ({ ...s, sidebarCollapsed: !s.sidebarCollapsed }));

  const toggleTool = (path: string) =>
    setState((s) => ({
      ...s,
      hiddenTools: s.hiddenTools.includes(path)
        ? s.hiddenTools.filter((p) => p !== path)
        : [...s.hiddenTools, path],
    }));

  const setAllToolsVisible = () => setState((s) => ({ ...s, hiddenTools: [] }));
  const isToolVisible = (path: string) => !state.hiddenTools.includes(path);

  return (
    <SettingsContext.Provider
      value={{ ...state, setTheme, setSidebarMode, setSidebarCollapsed, toggleSidebar, toggleTool, setAllToolsVisible, isToolVisible }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
