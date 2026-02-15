import { useContext } from "react";
import { SettingsContext } from "@/contexts/settingsStore";

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
