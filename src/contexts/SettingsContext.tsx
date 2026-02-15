import { useState, useEffect, ReactNode } from "react";
import { SettingsContext, loadSettings, saveSettings, type Theme, type SidebarMode } from "./settingsStore";

export type { Theme, SidebarMode } from "./settingsStore";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(loadSettings);

  useEffect(() => {
    saveSettings(state);
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
