import { useSettings } from "@/hooks/useSettings";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Theme } from "@/contexts/settingsStore";
import { THEMES, EDITOR_FONTS } from "./constants";

const SettingsAppearancePanel = () => {
  const settings = useSettings();

  return (
    <div id="settings-appearance" role="tabpanel" aria-labelledby="tab-appearance" className="settings-panel">
      {/* Section: Appearance */}
      <section aria-labelledby="settings-appearance-heading" className="settings-section">
        <h2 id="settings-appearance-heading" className="settings-section-heading">
          Appearance
        </h2>
        <div className="settings-section-content">
          <div className="settings-setting-row">
            <span className="settings-setting-label">Color theme</span>
            <div className="settings-setting-control">
              <Select value={settings.theme} onValueChange={(v) => settings.setTheme(v as Theme)}>
                <SelectTrigger size="sm" className="w-auto min-w-[10rem] focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THEMES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Text editor */}
      <section aria-labelledby="settings-editor-heading" className="settings-section">
        <h2 id="settings-editor-heading" className="settings-section-heading">
          Text editor
        </h2>
        <div className="settings-section-content">
          <div className="settings-setting-row">
            <span className="settings-setting-label">Font</span>
            <div className="settings-setting-control">
              <Select value={settings.editorFont} onValueChange={settings.setEditorFont}>
                <SelectTrigger size="sm" className="w-auto min-w-[12rem] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                  {EDITOR_FONTS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="settings-setting-row">
            <label htmlFor="settings-word-wrap" className="settings-setting-label cursor-pointer">
              Wrap word
            </label>
            <div className="settings-setting-control">
              <Checkbox
                id="settings-word-wrap"
                checked={settings.wordWrap}
                onCheckedChange={(checked) => settings.setWordWrap(checked === true)}
                aria-label="Wrap word"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsAppearancePanel;
