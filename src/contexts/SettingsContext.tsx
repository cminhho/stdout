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
    root.classList.remove("dark", "light", "deep-dark");

    if (state.theme === "dark") {
      root.classList.add("dark");
    } else if (state.theme === "light") {
      root.classList.add("light");
    } else if (state.theme === "deep-dark") {
      root.classList.add("deep-dark");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.add(mq.matches ? "dark" : "light");
      const handler = () => {
        root.classList.remove("dark", "light");
        root.classList.add(mq.matches ? "dark" : "light");
      };
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
