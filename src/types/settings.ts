/**
 * Shared types for settings UI and store (theme, sidebar, tabs, update check).
 */
import type { IndentOption } from "@/components/common/IndentSelect";

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
  /** Settings schema version for one-time default migrations. */
  settingsVersion: number;
  theme: Theme;
  sidebarMode: SidebarMode;
  sidebarCollapsed: boolean;
  /** Sidebar width in px when expanded (resizable). Clamped on load. */
  sidebarWidth: number;
  hiddenTools: string[];
  editorFont: string;
  /** App-wide default indentation for formatters that don't enforce their own convention. */
  defaultIndent: IndentOption;
}
