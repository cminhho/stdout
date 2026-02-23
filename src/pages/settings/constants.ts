import type { LucideIcon } from "lucide-react";
import { Settings, Wrench } from "lucide-react";
import type { Theme, SidebarMode } from "@/contexts/settingsStore";

export const DEFAULT_TITLE = "Settings";
export const DEFAULT_DESCRIPTION = "Customize your stdout experience";
export const UPDATE_BUTTON_LOADING_LABEL = "Checking…";
export const UPDATE_BUTTON_LABEL = "Check for updates";
export const SEARCH_PLACEHOLDER = "Search tools...";
export const SHOW_ALL_LABEL = "Show All";

export type SettingsTabId = "general" | "tools";

export const SETTINGS_TABS: {
  id: SettingsTabId;
  label: string;
  icon: LucideIcon;
  panelId: string;
}[] = [
  { id: "general", label: "General", icon: Settings, panelId: "settings-general" },
  { id: "tools", label: "Manage Tools", icon: Wrench, panelId: "settings-tools" },
];

export const THEMES: { value: Theme; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "Light background with dark text" },
  { value: "dark", label: "Dark", desc: "Dark background with light text" },
  { value: "deep-dark", label: "Deep dark", desc: "Near-black, easy on the eyes" },
  { value: "system", label: "System", desc: "Follow OS preference" },
];

export const SIDEBAR_MODES: { value: SidebarMode; label: string; desc: string }[] = [
  { value: "grouped", label: "Grouped", desc: "Tools organized in collapsible groups" },
  { value: "flat", label: "Flat", desc: "All tools listed without group headers" },
];
