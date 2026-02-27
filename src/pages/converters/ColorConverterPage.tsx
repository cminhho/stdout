import { useState, useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import {
  COLOR_CONVERTER_DEFAULT_HEX,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  formatRgbString,
  formatHslString,
} from "@/utils/colorConverter";

const ColorConverterPage = () => {
  const [hex, setHex] = useState(COLOR_CONVERTER_DEFAULT_HEX);

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : null), [rgb]);

  const handleRgbChange = (r: number, g: number, b: number) => setHex(rgbToHex(r, g, b));
  const handleHslChange = (h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l);
    setHex(rgbToHex(r, g, b));
  };

  const hexStr = hex.toUpperCase();
  const rgbStr = rgb ? formatRgbString(rgb) : "";
  const hslStr = hsl ? formatHslString(hsl) : "";

  const summaryItems = [
    { label: "HEX", value: hexStr },
    { label: "RGB", value: rgbStr },
    { label: "HSL", value: hslStr },
  ];

  const isDefault = hex === COLOR_CONVERTER_DEFAULT_HEX;

  const pane = {
    title: "Color Converter",
    toolbar: !isDefault ? <ClearButton onClick={() => setHex(COLOR_CONVERTER_DEFAULT_HEX)} /> : undefined,
    children: (
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-auto">
        <section className="tool-section-card shrink-0 space-y-3" aria-label="Preview">
          <h2 className="home-section-label mb-0">Preview</h2>
          <div
            className="w-32 h-32 min-h-[8rem] rounded-[var(--home-radius-card)] border border-border shadow-md shrink-0 transition-colors duration-150"
            style={{ backgroundColor: hex }}
            role="img"
            aria-label={`Color preview: ${hexStr}`}
          />
        </section>

        <section className="tool-section-card shrink-0 space-y-4" aria-label="Inputs">
          <h2 className="home-section-label mb-0">Inputs</h2>
          <div className="space-y-1.5">
            <Label htmlFor="color-hex-input" className="tool-field-label">
              HEX
            </Label>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                id="color-hex-input"
                className="font-mono flex-1 min-w-0 h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                aria-label="HEX color value"
              />
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-10 h-10 min-h-touch min-w-[2.5rem] rounded-[var(--radius-button)] cursor-pointer border border-border bg-transparent"
                aria-label="Pick color"
              />
              <CopyButton text={hexStr} className="shrink-0" />
            </div>
          </div>

          {rgb && (
            <div className="space-y-1.5">
              <Label className="tool-field-label">RGB</Label>
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[0]}
                  onChange={(e) => handleRgbChange(+e.target.value, rgb[1], rgb[2])}
                  className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Red"
                />
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[1]}
                  onChange={(e) => handleRgbChange(rgb[0], +e.target.value, rgb[2])}
                  className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Green"
                />
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[2]}
                  onChange={(e) => handleRgbChange(rgb[0], rgb[1], +e.target.value)}
                  className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Blue"
                />
                <CopyButton text={rgbStr} className="shrink-0" />
              </div>
            </div>
          )}

          {hsl && (
            <div className="space-y-1.5">
              <Label className="tool-field-label">HSL</Label>
              <div className="flex flex-wrap gap-2 items-center">
                <Input
                  type="number"
                  min={0}
                  max={360}
                  value={hsl[0]}
                  onChange={(e) => handleHslChange(+e.target.value, hsl[1], hsl[2])}
                  className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Hue"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl[1]}
                  onChange={(e) => handleHslChange(hsl[0], +e.target.value, hsl[2])}
                  className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Saturation"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl[2]}
                  onChange={(e) => handleHslChange(hsl[0], hsl[1], +e.target.value)}
                  className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Lightness"
                />
                <CopyButton text={hslStr} className="shrink-0" />
              </div>
            </div>
          )}
        </section>

        <section className="tool-section-card shrink-0" aria-label="Summary">
          <h2 className="home-section-label mb-0">Summary</h2>
          <div className="grid grid-cols-3 gap-[var(--home-space-sm)] text-center mt-2">
            {summaryItems.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-[var(--home-radius-card)] border border-border bg-muted/30 dark:bg-muted/20 px-3 py-2.5 transition-colors duration-150"
              >
                <div className="tool-caption mb-0.5">{label}</div>
                <div className="font-mono text-[length:var(--text-ui)] font-medium text-foreground truncate" title={value}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl mx-auto">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default ColorConverterPage;
