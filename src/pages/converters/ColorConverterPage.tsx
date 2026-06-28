import { useMemo, useState } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import {
  COLOR_CONVERTER_DEFAULT_HEX,
  type ColorValue,
  bestTextColor,
  clampAlpha,
  colorScale,
  colorToHex,
  colorToHsl,
  colorToHslString,
  colorToHslaString,
  colorToRgbString,
  colorToRgbaString,
  contrastGrade,
  contrastRatio,
  cssVariable,
  hslToRgb,
  parseColor,
  previewBackground,
} from "@/utils/colorConverter";

const DEFAULT_COLOR = parseColor(COLOR_CONVERTER_DEFAULT_HEX) ?? { r: 59, g: 130, b: 246, a: 1 };
const WHITE: ColorValue = { r: 255, g: 255, b: 255, a: 1 };
const BLACK: ColorValue = { r: 0, g: 0, b: 0, a: 1 };

function swatchTextColor(color: ColorValue): string {
  return colorToHex(bestTextColor(color)).toUpperCase();
}

function alphaPercent(alpha: number): number {
  return Math.round(alpha * 100);
}

const ColorConverterPage = () => {
  const [input, setInput] = useState(COLOR_CONVERTER_DEFAULT_HEX);
  const [color, setColor] = useState<ColorValue>(DEFAULT_COLOR);

  const parsedInput = useMemo(() => parseColor(input), [input]);
  const inputInvalid = input.trim() !== "" && parsedInput === null;
  const hsl = useMemo(() => colorToHsl(color), [color]);
  const hex = colorToHex(color, false).toUpperCase();
  const hexa = colorToHex(color, true).toUpperCase();
  const rgb = colorToRgbString(color);
  const rgba = colorToRgbaString(color);
  const hslText = colorToHslString(color);
  const hsla = colorToHslaString(color);
  const cssVar = cssVariable("brand", color.a < 1 ? rgba : hex);
  const tailwindText = `text-[${color.a < 1 ? hexa : hex}]`;
  const tailwindBg = `bg-[${color.a < 1 ? hexa : hex}]`;
  const scale = useMemo(() => colorScale(color), [color]);
  const bestText = swatchTextColor(color);
  const whiteRatio = contrastRatio(WHITE, color);
  const blackRatio = contrastRatio(BLACK, color);

  const applyColor = (next: ColorValue, nextInput = colorToHex(next, next.a < 1).toUpperCase()) => {
    setColor(next);
    setInput(nextInput);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    const parsed = parseColor(value);
    if (parsed) setColor(parsed);
  };

  const handleRgbChange = (channel: "r" | "g" | "b", value: number) => {
    applyColor({ ...color, [channel]: value });
  };

  const handleHslChange = (index: 0 | 1 | 2, value: number) => {
    const nextHsl: [number, number, number] = [...hsl];
    nextHsl[index] = value;
    const [r, g, b] = hslToRgb(...nextHsl);
    applyColor({ ...color, r, g, b });
  };

  const handleAlphaChange = (value: number) => {
    applyColor({ ...color, a: clampAlpha(value) });
  };

  const outputItems = [
    { label: "HEX", value: hex },
    { label: "HEXA", value: hexa },
    { label: "RGB", value: rgb },
    { label: "RGBA", value: rgba },
    { label: "HSL", value: hslText },
    { label: "HSLA", value: hsla },
    { label: "CSS var", value: cssVar },
    { label: "Tailwind text", value: tailwindText },
    { label: "Tailwind bg", value: tailwindBg },
  ];

  const contrastItems = [
    { label: "White text", textColor: "#FFFFFF", ratio: whiteRatio },
    { label: "Black text", textColor: "#000000", ratio: blackRatio },
  ];

  const isDefault = input === COLOR_CONVERTER_DEFAULT_HEX && hex === COLOR_CONVERTER_DEFAULT_HEX.toUpperCase() && color.a === 1;

  const pane = {
    title: "Color Converter",
    toolbar: !isDefault ? <ClearButton onClick={() => applyColor(DEFAULT_COLOR, COLOR_CONVERTER_DEFAULT_HEX)} /> : undefined,
    children: (
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-auto">
        <section className="tool-section-card shrink-0 space-y-3" aria-label="Preview">
          <h2 className="home-section-label mb-0">Preview</h2>
          <div className="flex flex-wrap items-stretch gap-4">
            <div
              className="w-36 h-36 min-h-[9rem] rounded-[var(--home-radius-card)] border border-border shadow-md shrink-0 overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(-45deg, hsl(var(--muted)) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, hsl(var(--muted)) 75%), linear-gradient(-45deg, transparent 75%, hsl(var(--muted)) 75%)",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
                backgroundSize: "16px 16px",
              }}
              role="img"
              aria-label={`Color preview: ${color.a < 1 ? hexa : hex}`}
            >
              <div className="h-full w-full" style={{ backgroundColor: previewBackground(color) }} />
            </div>
            <div
              className="flex min-w-[14rem] flex-1 items-center justify-center rounded-[var(--home-radius-card)] border border-border px-4 py-5 text-center font-mono text-[length:var(--text-ui)] font-semibold"
              style={{ backgroundColor: previewBackground(color), color: bestText }}
            >
              {bestText} on {color.a < 1 ? hexa : hex}
            </div>
          </div>
        </section>

        <section className="tool-section-card shrink-0 space-y-4" aria-label="Inputs">
          <h2 className="home-section-label mb-0">Inputs</h2>
          <div className="space-y-1.5">
            <Label htmlFor="color-universal-input" className="tool-field-label">
              Color
            </Label>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                id="color-universal-input"
                className="font-mono flex-1 min-w-[14rem] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="hex, rgb(), hsl(), name"
                aria-label="Color value"
                aria-invalid={inputInvalid}
              />
              <input
                type="color"
                value={hex}
                onChange={(e) => applyColor({ ...color, ...(parseColor(e.target.value) ?? color) }, e.target.value)}
                className="w-10 h-10 min-h-touch min-w-[2.5rem] rounded-[var(--radius-button)] cursor-pointer border border-border bg-transparent"
                aria-label="Pick color"
              />
              <CopyButton text={color.a < 1 ? hexa : hex} className="shrink-0" />
            </div>
            {inputInvalid ? <div className="tool-caption text-destructive">Invalid color</div> : null}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="tool-field-label">RGB</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {(["r", "g", "b"] as const).map((channel) => (
                  <Input
                    key={channel}
                    type="number"
                    min={0}
                    max={255}
                    value={color[channel]}
                    onChange={(e) => handleRgbChange(channel, Number(e.target.value))}
                    className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                    aria-label={channel.toUpperCase()}
                  />
                ))}
                <CopyButton text={rgb} className="shrink-0" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="tool-field-label">HSL</Label>
              <div className="flex flex-wrap gap-2 items-center">
                {hsl.map((value, index) => (
                  <Input
                    key={index}
                    type="number"
                    min={0}
                    max={index === 0 ? 360 : 100}
                    value={value}
                    onChange={(e) => handleHslChange(index as 0 | 1 | 2, Number(e.target.value))}
                    className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                    aria-label={index === 0 ? "Hue" : index === 1 ? "Saturation" : "Lightness"}
                  />
                ))}
                <CopyButton text={hslText} className="shrink-0" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="color-alpha-range" className="tool-field-label">
              Alpha
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              <input
                id="color-alpha-range"
                type="range"
                min={0}
                max={100}
                step={1}
                value={alphaPercent(color.a)}
                onChange={(e) => handleAlphaChange(Number(e.target.value) / 100)}
                className="h-9 min-w-[12rem] flex-1 accent-primary"
                aria-label="Alpha"
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={alphaPercent(color.a)}
                onChange={(e) => handleAlphaChange(Number(e.target.value) / 100)}
                className="w-20 font-mono text-[length:var(--text-ui)] h-9 rounded-[var(--radius-button)] transition-colors duration-150"
                aria-label="Alpha percent"
              />
              <CopyButton text={rgba} className="shrink-0" />
            </div>
          </div>
        </section>

        <section className="tool-section-card shrink-0" aria-label="Copy outputs">
          <h2 className="home-section-label mb-0">Outputs</h2>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {outputItems.map(({ label, value }) => (
              <div
                key={label}
                className="flex min-h-touch items-center gap-2 rounded-[var(--home-radius-card)] border border-border bg-muted/30 px-3 py-2 transition-colors duration-150 dark:bg-muted/20"
              >
                <span className="tool-caption w-24 shrink-0">{label}</span>
                <code className="min-w-0 flex-1 truncate font-mono text-[length:var(--text-ui)] text-foreground" title={value}>
                  {value}
                </code>
                <CopyButton text={value} className="shrink-0" />
              </div>
            ))}
          </div>
        </section>

        <section className="tool-section-card shrink-0" aria-label="Contrast">
          <h2 className="home-section-label mb-0">Contrast</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {contrastItems.map(({ label, textColor, ratio }) => {
              const grade = contrastGrade(ratio);
              return (
                <div
                  key={label}
                  className="rounded-[var(--home-radius-card)] border border-border p-4 transition-colors duration-150"
                  style={{ backgroundColor: previewBackground(color), color: textColor }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[length:var(--text-ui)] font-semibold">{label}</span>
                    <span className="rounded-[var(--radius-button)] border border-current/30 px-2 py-0.5 text-xs font-semibold">
                      {grade}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 font-mono text-[length:var(--text-ui)]">
                    <span>{ratio}:1</span>
                    <CopyButton text={`color: ${textColor}; background-color: ${color.a < 1 ? rgba : hex};`} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="tool-section-card shrink-0" aria-label="Color scale">
          <h2 className="home-section-label mb-0">Scale</h2>
          <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
            {scale.map((step) => (
              <div
                key={step.label}
                className="overflow-hidden rounded-[var(--home-radius-card)] border border-border bg-muted/20"
              >
                <div
                  className="flex h-16 items-center justify-center px-2 text-center font-mono text-xs font-semibold"
                  style={{ backgroundColor: previewBackground(step.color), color: swatchTextColor(step.color) }}
                >
                  {step.label}
                </div>
                <div className="flex items-center gap-1 px-2 py-1.5">
                  <code className="min-w-0 flex-1 truncate font-mono text-xs text-foreground" title={step.hex}>
                    {step.hex}
                  </code>
                  <CopyButton text={step.hex} className="shrink-0" />
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
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-5xl mx-auto">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default ColorConverterPage;
