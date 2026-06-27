import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrefSection, PrefGroup, PrefRow, PrefDescription } from "@/components/settings";
import type { Theme, SidebarMode } from "@/contexts/settingsStore";
import type { IndentOption } from "@/components/common/IndentSelect";
import { THEMES, EDITOR_FONTS, SIDEBAR_MODES, INDENT_DEFAULT_OPTIONS } from "./constants";

const DEFAULT_EDITOR_FONT = EDITOR_FONTS[0].value;

const SettingsAppearancePanel = () => {
  const settings = useSettings();
  const fontValue = settings.editorFont;
  const isValidFont = EDITOR_FONTS.some((f) => f.value === fontValue);
  const effectiveFont = isValidFont ? fontValue : DEFAULT_EDITOR_FONT;

  useEffect(() => {
    if (!isValidFont && fontValue !== effectiveFont) {
      settings.setEditorFont(DEFAULT_EDITOR_FONT);
    }
  }, [fontValue, isValidFont, effectiveFont, settings]);

  return (
    <div id="settings-appearance" role="tabpanel" aria-labelledby="tab-appearance" className="settings-panel">
      <PrefSection heading="Appearance" headingId="settings-appearance-heading">
        <PrefGroup>
          <PrefRow
            label="Color theme"
            control={
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
            }
          />
          <PrefRow
            label="Sidebar nav"
            control={
              <Select value={settings.sidebarMode} onValueChange={(v) => settings.setSidebarMode(v as SidebarMode)}>
                <SelectTrigger size="sm" className="w-auto min-w-[10rem] focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIDEBAR_MODES.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </PrefGroup>
        <PrefDescription>Grouped: tools by category with expand/collapse. Flat: single list of tools.</PrefDescription>
      </PrefSection>

      <PrefSection heading="Text editor" headingId="settings-editor-heading">
        <PrefGroup>
          <PrefRow
            label="Font"
            control={
              <Select value={effectiveFont} onValueChange={settings.setEditorFont}>
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
            }
          />
        </PrefGroup>
      </PrefSection>

      <PrefSection heading="Formatting" headingId="settings-formatting-heading">
        <PrefGroup>
          <PrefRow
            label="Default indentation"
            control={
              <Select
                value={typeof settings.defaultIndent === "number" ? String(settings.defaultIndent) : settings.defaultIndent}
                onValueChange={(v) => settings.setDefaultIndent(v === "tab" ? "tab" : (Number(v) as IndentOption))}
              >
                <SelectTrigger size="sm" className="w-auto min-w-[10rem] focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDENT_DEFAULT_OPTIONS.map((o) => (
                    <SelectItem key={String(o.value)} value={typeof o.value === "number" ? String(o.value) : o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </PrefGroup>
        <PrefDescription>Default indent for new formatter tabs. Tools with their own convention keep it (e.g. JSON↔YAML stays 2-space); you can still change indentation per tool.</PrefDescription>
      </PrefSection>
    </div>
  );
};

export default SettingsAppearancePanel;
