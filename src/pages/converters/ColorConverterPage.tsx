import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/CopyButton";
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

  return (
    <ToolLayout title={tool?.label ?? DEFAULT_TITLE} description={tool?.description ?? DEFAULT_DESCRIPTION}>
      <div className="max-w-2xl space-y-6">
        <div className="flex gap-6 items-start">
          <div
            className="w-32 h-32 rounded-xl border border-border shadow-lg shrink-0"
            style={{ backgroundColor: hex }}
          />
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">HEX</Label>
              <div className="flex gap-2 items-center">
                <Input className="font-mono" value={hex} onChange={(e) => setHex(e.target.value)} />
                <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <CopyButton text={hexStr} />
              </div>
            </div>

            {rgb && (
              <div>
                <Label className="text-xs text-muted-foreground">RGB</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min={0} max={255} value={rgb[0]} onChange={(e) => handleRgbChange(+e.target.value, rgb[1], rgb[2])} className="w-20 font-mono text-sm" />
                  <Input type="number" min={0} max={255} value={rgb[1]} onChange={(e) => handleRgbChange(rgb[0], +e.target.value, rgb[2])} className="w-20 font-mono text-sm" />
                  <Input type="number" min={0} max={255} value={rgb[2]} onChange={(e) => handleRgbChange(rgb[0], rgb[1], +e.target.value)} className="w-20 font-mono text-sm" />
                  <CopyButton text={rgbStr} />
                </div>
              </div>
            )}

            {hsl && (
              <div>
                <Label className="text-xs text-muted-foreground">HSL</Label>
                <div className="flex gap-2 items-center">
                  <Input type="number" min={0} max={360} value={hsl[0]} onChange={(e) => handleHslChange(+e.target.value, hsl[1], hsl[2])} className="w-20 font-mono text-sm" />
                  <Input type="number" min={0} max={100} value={hsl[1]} onChange={(e) => handleHslChange(hsl[0], +e.target.value, hsl[2])} className="w-20 font-mono text-sm" />
                  <Input type="number" min={0} max={100} value={hsl[2]} onChange={(e) => handleHslChange(hsl[0], hsl[1], +e.target.value)} className="w-20 font-mono text-sm" />
                  <CopyButton text={hslStr} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          {summaryItems.map(({ label, value }) => (
            <div key={label} className={SUMMARY_CARD_CLASS}>
              <div className={SUMMARY_LABEL_CLASS}>{label}</div>
              <div className={SUMMARY_VALUE_CLASS}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
};

export default ColorConverterPage;
