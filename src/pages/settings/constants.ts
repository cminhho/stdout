import type { LucideIcon } from "lucide-react";
import { Settings, Palette, Wrench } from "lucide-react";
import type { Theme, SidebarMode } from "@/contexts/settingsStore";

export const DEFAULT_TITLE = "Settings";
export const DEFAULT_DESCRIPTION = "Customize your stdout experience";
export const UPDATE_BUTTON_LOADING_LABEL = "Checking…";
export const UPDATE_BUTTON_LABEL = "Check for updates";
export const SEARCH_PLACEHOLDER = "Search tools...";
export const SHOW_ALL_LABEL = "Show All";

export type SettingsTabId = "general" | "appearance" | "tools";

export const SETTINGS_TABS: {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
  panelId: string;
}[] = [
  { id: "general", label: "General", icon: Settings, panelId: "settings-general" },
  { id: "appearance", label: "Appearance", icon: Palette, panelId: "settings-appearance" },
  { id: "tools", label: "Manage Tools", icon: Wrench, panelId: "settings-tools" },
];

export const THEMES: { value: Theme; label: string; desc: string }[] = [
  { value: "system", label: "Auto", desc: "Follow OS preference" },
  { value: "light", label: "Light", desc: "Light background with dark text" },
  { value: "dark", label: "Dark", desc: "Dark background with light text" },
  { value: "deep-dark", label: "Deep dark", desc: "Near-black, easy on the eyes" },
];

export const SIDEBAR_MODES: { value: SidebarMode; label: string; desc: string }[] = [
  { value: "grouped", label: "Grouped", desc: "Tools organized in collapsible groups" },
  { value: "flat", label: "Flat", desc: "All tools listed without group headers" },
];

/** Font options for code/editor (1–2 only). Value is CSS font-family; applied via --font-mono. */
export const EDITOR_FONTS: { value: string; label: string }[] = [
  { value: "ui-monospace, ui-serif, monospace", label: "System monospace" },
  { value: "'Fira Code', monospace", label: "Fira Code" },
];
