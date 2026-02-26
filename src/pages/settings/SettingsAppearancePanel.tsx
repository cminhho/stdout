import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PrefSection, PrefGroup, PrefRow, PrefDescription } from "@/components/settings";
import type { Theme, SidebarMode, GlassTint } from "@/types/settings";
import { THEMES, EDITOR_FONTS } from "./constants";

const SIDEBAR_NAV_OPTIONS: { value: SidebarMode; label: string }[] = [
  { value: "grouped", label: "Grouped" },
  { value: "flat", label: "Flat" },
];

const DEFAULT_EDITOR_FONT = EDITOR_FONTS[0].value;

const GLASS_TINT_OPTIONS: { value: GlassTint; label: string }[] = [
  { value: "none", label: "None" },
  { value: "accent", label: "Tint with accent" },
];

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
            label="Liquid Glass"
            control={
              <Checkbox
                id="settings-liquid-glass"
                checked={settings.liquidGlass}
                onCheckedChange={(v) => settings.setLiquidGlass(v === true)}
                aria-label="Enable Liquid Glass (translucent, specular surfaces)"
              />
            }
          />
          <PrefRow
            label="Glass tint"
            control={
              <Select
                value={settings.glassTint}
                onValueChange={(v) => settings.setGlassTint(v as GlassTint)}
                disabled={!settings.liquidGlass}
              >
                <SelectTrigger size="sm" className="w-auto min-w-[10rem] focus:ring-0 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GLASS_TINT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
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
                  {SIDEBAR_NAV_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        </PrefGroup>
        <PrefDescription>Liquid Glass: translucent, specular menus and windows. Tint: subtle accent on glass (adapts to theme). Sidebar nav: grouped (by category) or flat list.</PrefDescription>
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
    </div>
  );
};

export default SettingsAppearancePanel;
