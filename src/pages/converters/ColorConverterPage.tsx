import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolPane from "@/components/ToolPane";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/CopyButton";
import { ClearButton } from "@/components/ClearButton";
import {
  COLOR_CONVERTER_DEFAULT_HEX,
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  formatRgbString,
  formatHslString,
} from "@/utils/colorConverter";

const DEFAULT_TITLE = "Color Converter";
const DEFAULT_DESCRIPTION = "Convert colors between HEX, RGB, HSL formats";
const SUMMARY_CARD_CLASS = "bg-muted rounded-lg p-3";
const SUMMARY_LABEL_CLASS = "text-xs text-muted-foreground mb-1";
const SUMMARY_VALUE_CLASS = "font-mono text-sm font-medium";

const ColorConverterPage = () => {
  const tool = useCurrentTool();
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
    title: DEFAULT_TITLE,
    toolbar: !isDefault ? <ClearButton onClick={() => setHex(COLOR_CONVERTER_DEFAULT_HEX)} /> : undefined,
    children: (
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-auto">
        <div
          className="w-32 h-32 rounded-xl border border-border shadow-lg shrink-0"
          style={{ backgroundColor: hex }}
        />
        <div className="space-y-3 shrink-0">
          <div>
            <Label className="text-xs text-muted-foreground">HEX</Label>
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
              <Label className="text-xs text-muted-foreground">RGB</Label>
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
              <Label className="text-xs text-muted-foreground">HSL</Label>
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

        <div className="grid grid-cols-3 gap-3 text-center shrink-0">
          {summaryItems.map(({ label, value }) => (
            <div key={label} className={SUMMARY_CARD_CLASS}>
              <div className={SUMMARY_LABEL_CLASS}>{label}</div>
              <div className={SUMMARY_VALUE_CLASS}>{value}</div>
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
