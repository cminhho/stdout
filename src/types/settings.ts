/**
 * Shared types for settings UI and store (theme, sidebar, tabs, update check).
 */

/** Settings modal tab id. */
export type SettingsTabId = "general" | "appearance" | "tools";

/** Web update check state (idle → loading → current | available | error). */
export type UpdateCheckState = "idle" | "loading" | "current" | "available" | "error";

/** Theme preference. */
export type Theme = "dark" | "light" | "deep-dark" | "system";

/** Sidebar display mode. */
export type SidebarMode = "grouped" | "flat";

/** Persisted settings state (stored in localStorage). */
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
