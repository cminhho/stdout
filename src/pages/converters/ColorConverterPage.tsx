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
        <div
          className="w-32 h-32 rounded-card border border-border shadow-lg shrink-0"
          style={{ backgroundColor: hex }}
        />
        <div className="space-y-3 shrink-0">
          <div>
            <Label className="tool-field-label">HEX</Label>
            <div className="flex gap-2 items-center mt-1">
              <Input className="font-mono flex-1" value={hex} onChange={(e) => setHex(e.target.value)} />
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border-0"
              />
              <CopyButton text={hexStr} />
            </div>
          </div>

          {rgb && (
            <div>
              <Label className="tool-field-label">RGB</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[0]}
                  onChange={(e) => handleRgbChange(+e.target.value, rgb[1], rgb[2])}
                  className="w-20 font-mono text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[1]}
                  onChange={(e) => handleRgbChange(rgb[0], +e.target.value, rgb[2])}
                  className="w-20 font-mono text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  max={255}
                  value={rgb[2]}
                  onChange={(e) => handleRgbChange(rgb[0], rgb[1], +e.target.value)}
                  className="w-20 font-mono text-sm"
                />
                <CopyButton text={rgbStr} />
              </div>
            </div>
          )}

          {hsl && (
            <div>
              <Label className="tool-field-label">HSL</Label>
              <div className="flex gap-2 items-center mt-1">
                <Input
                  type="number"
                  min={0}
                  max={360}
                  value={hsl[0]}
                  onChange={(e) => handleHslChange(+e.target.value, hsl[1], hsl[2])}
                  className="w-20 font-mono text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl[1]}
                  onChange={(e) => handleHslChange(hsl[0], +e.target.value, hsl[2])}
                  className="w-20 font-mono text-sm"
                />
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={hsl[2]}
                  onChange={(e) => handleHslChange(hsl[0], hsl[1], +e.target.value)}
                  className="w-20 font-mono text-sm"
                />
                <CopyButton text={hslStr} />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-[var(--home-space-sm)] text-center shrink-0">
          {summaryItems.map(({ label, value }) => (
            <div key={label} className="bg-muted rounded-card p-3">
              <div className="tool-caption mb-1">{label}</div>
              <div className="font-mono text-sm font-medium">{value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default ColorConverterPage;
