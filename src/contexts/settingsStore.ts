import { createContext } from "react";

export type Theme = "dark" | "light" | "deep-dark" | "system";
export type SidebarMode = "grouped" | "flat";

export interface SettingsState {
  theme: Theme;
  sidebarMode: SidebarMode;
  sidebarCollapsed: boolean;
  hiddenTools: string[];
}

export interface SettingsContextType extends SettingsState {
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

export function loadSettings(): SettingsState {
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
  } catch { /* invalid stored settings */ }
  return defaults;
}

export function saveSettings(s: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const SettingsContext = createContext<SettingsContextType | null>(null);
