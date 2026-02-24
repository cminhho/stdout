import { Palette, LayoutList } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/utils/cn";
import { THEMES, SIDEBAR_MODES } from "./constants";

const SettingsAppearancePanel = () => {
  const settings = useSettings();

  return (
    <div id="settings-appearance" role="tabpanel" aria-labelledby="tab-appearance" className="settings-panel">
      <section aria-labelledby="settings-theme-heading" className="settings-section">
        <h2 id="settings-theme-heading" className="settings-section-heading">
          <Palette className="h-4 w-4 text-primary" aria-hidden />
          Theme
        </h2>
        <div className="settings-option-grid grid grid-cols-2 sm:grid-cols-4" role="group" aria-label="Theme selection">
          {THEMES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => settings.setTheme(t.value)}
              aria-pressed={settings.theme === t.value}
              className={cn("settings-option-card", settings.theme === t.value && "settings-option-card--selected")}
            >
              <div className="settings-label">{t.label}</div>
              <div className="settings-body-text">{t.desc}</div>
            </button>
          ))}
        </div>
      </section>

      <section aria-labelledby="settings-sidebar-heading" className="settings-section">
        <h2 id="settings-sidebar-heading" className="settings-section-heading">
          <LayoutList className="h-4 w-4 text-primary" aria-hidden />
          Sidebar Layout
        </h2>
        <div className="settings-option-grid grid grid-cols-2" role="group" aria-label="Sidebar layout">
          {SIDEBAR_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => settings.setSidebarMode(m.value)}
              aria-pressed={settings.sidebarMode === m.value}
              className={cn("settings-option-card", settings.sidebarMode === m.value && "settings-option-card--selected")}
            >
              <div className="settings-label">{m.label}</div>
              <div className="settings-body-text">{m.desc}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsAppearancePanel;
