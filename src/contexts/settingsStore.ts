import { createContext } from "react";

export type Theme = "dark" | "light" | "deep-dark" | "system";
export type SidebarMode = "grouped" | "flat";

export interface SettingsState {
  theme: Theme;
  sidebarMode: SidebarMode;
  sidebarCollapsed: boolean;
  /** Sidebar width in px when expanded (resizable). Clamped on load. */
  sidebarWidth: number;
  hiddenTools: string[];
  editorFont: string;
  wordWrap: boolean;
}

export interface SettingsContextType extends SettingsState {
  setTheme: (t: Theme) => void;
  setSidebarMode: (m: SidebarMode) => void;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  toggleTool: (path: string) => void;
  setAllToolsVisible: () => void;
  isToolVisible: (path: string) => boolean;
  setEditorFont: (font: string) => void;
  setWordWrap: (wrap: boolean) => void;
}

const STORAGE_KEY = "stdout-settings";

const SIDEBAR_WIDTH_MIN = 200;
const SIDEBAR_WIDTH_MAX = 480;
const SIDEBAR_WIDTH_DEFAULT = 272;

const defaults: SettingsState = {
  theme: "system",
  sidebarMode: "grouped",
  sidebarCollapsed: false,
  sidebarWidth: SIDEBAR_WIDTH_DEFAULT,
  hiddenTools: [],
  editorFont: "ui-monospace, ui-serif, monospace",
  wordWrap: false,
};

function clampSidebarWidth(w: number): number {
  return Math.min(SIDEBAR_WIDTH_MAX, Math.max(SIDEBAR_WIDTH_MIN, w));
}

export function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SettingsState>;
      const w = typeof parsed.sidebarWidth === "number" ? parsed.sidebarWidth : defaults.sidebarWidth;
      return {
        theme: parsed.theme ?? defaults.theme,
        sidebarMode: parsed.sidebarMode ?? defaults.sidebarMode,
        sidebarCollapsed: parsed.sidebarCollapsed ?? defaults.sidebarCollapsed,
        sidebarWidth: clampSidebarWidth(w),
        hiddenTools: Array.isArray(parsed.hiddenTools) ? parsed.hiddenTools : defaults.hiddenTools,
        editorFont: typeof parsed.editorFont === "string" ? parsed.editorFont : defaults.editorFont,
        wordWrap: typeof parsed.wordWrap === "boolean" ? parsed.wordWrap : defaults.wordWrap,
      };
    }
  } catch { /* invalid stored settings */ }
  return defaults;
}

export { SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX, SIDEBAR_WIDTH_DEFAULT, clampSidebarWidth };

export function saveSettings(s: SettingsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export const SettingsContext = createContext<SettingsContextType | null>(null);
