import { useState, useEffect, ReactNode } from "react";
import { SettingsContext, loadSettings, saveSettings, type Theme, type SidebarMode } from "./settingsStore";

export type { Theme, SidebarMode } from "./settingsStore";

const THEME_COLORS: Record<string, string> = { light: "#fafafa", dark: "#252a31", "deep-dark": "#121212" };

function applyResolvedTheme(resolved: "light" | "dark" | "deep-dark") {
  const root = document.documentElement;
  root.classList.remove("dark", "light", "deep-dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved === "light" ? "light" : "dark";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[resolved] ?? THEME_COLORS.light);
}

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(loadSettings);

  useEffect(() => {
    saveSettings(state);
  }, [state]);

  useEffect(() => {
    if (state.theme === "dark") {
      applyResolvedTheme("dark");
      return;
    }
    if (state.theme === "light") {
      applyResolvedTheme("light");
      return;
    }
    if (state.theme === "deep-dark") {
      applyResolvedTheme("deep-dark");
      return;
    }
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const resolve = () => (mq.matches ? "dark" : "light");
    applyResolvedTheme(resolve());
    const handler = () => applyResolvedTheme(resolve());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
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
