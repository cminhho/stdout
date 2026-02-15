import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/CopyButton";

const hexToRgb = (hex: string): [number, number, number] | null => {
  const h = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const rgbToHex = (r: number, g: number, b: number): string =>
  "#" + [r, g, b].map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [Math.round(hue2rgb(p, q, h + 1 / 3) * 255), Math.round(hue2rgb(p, q, h) * 255), Math.round(hue2rgb(p, q, h - 1 / 3) * 255)];
};

const ColorConverterPage = () => {
  const tool = useCurrentTool();
  const [hex, setHex] = useState("#3b82f6");

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => (rgb ? rgbToHsl(...rgb) : null), [rgb]);

  const handleRgbChange = (r: number, g: number, b: number) => setHex(rgbToHex(r, g, b));
  const handleHslChange = (h: number, s: number, l: number) => {
    const [r, g, b] = hslToRgb(h, s, l);
    setHex(rgbToHex(r, g, b));
  };

  const hexStr = hex.toUpperCase();
  const rgbStr = rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : "";
  const hslStr = hsl ? `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)` : "";

  return (
    <ToolLayout title={tool?.label ?? "Color Converter"} description={tool?.description ?? "Convert colors between HEX, RGB, HSL formats"}>
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
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">HEX</div>
            <div className="font-mono text-sm font-medium">{hexStr}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">RGB</div>
            <div className="font-mono text-sm font-medium">{rgbStr}</div>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">HSL</div>
            <div className="font-mono text-sm font-medium">{hslStr}</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default ColorConverterPage;
