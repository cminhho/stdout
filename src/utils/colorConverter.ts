/**
 * Color conversion and small UI-productivity helpers.
 */

export const COLOR_CONVERTER_DEFAULT_HEX = "#3b82f6";

export interface ColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ColorScaleStep {
  label: string;
  color: ColorValue;
  hex: string;
}

const NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  blue: "#0000ff",
  cyan: "#00ffff",
  gray: "#808080",
  green: "#008000",
  grey: "#808080",
  lime: "#00ff00",
  magenta: "#ff00ff",
  orange: "#ffa500",
  pink: "#ffc0cb",
  purple: "#800080",
  red: "#ff0000",
  transparent: "#00000000",
  white: "#ffffff",
  yellow: "#ffff00",
};

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function clampByte(value: number): number {
  return Math.round(clamp(value, 0, 255));
}

export function clampAlpha(value: number): number {
  return Math.round(clamp(value, 0, 1) * 100) / 100;
}

function normalizeHue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return ((value % 360) + 360) % 360;
}

function parseAlpha(value: string | undefined): number {
  if (value == null || value === "") return 1;
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) return clampAlpha(parseFloat(trimmed) / 100);
  return clampAlpha(parseFloat(trimmed));
}

function parseRgbChannel(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith("%")) return clampByte((parseFloat(trimmed) / 100) * 255);
  return clampByte(parseFloat(trimmed));
}

function parsePercent(value: string): number {
  return clamp(parseFloat(value.trim().replace("%", "")), 0, 100);
}

function splitCssFunctionArgs(raw: string): string[] {
  const normalized = raw.trim().replace(/\s*\/\s*/, " ");
  if (normalized.includes(",")) return normalized.split(",").map((part) => part.trim()).filter(Boolean);
  return normalized.split(/\s+/).filter(Boolean);
}

function colorToCss(color: ColorValue): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

function namedColorToHex(input: string): string | null {
  const key = input.trim().toLowerCase();
  if (NAMED_COLORS[key]) return NAMED_COLORS[key];
  if (typeof document === "undefined") return null;

  const probe = document.createElement("span");
  probe.style.color = "";
  probe.style.color = key;
  if (!probe.style.color) return null;
  document.body.appendChild(probe);
  const computed = window.getComputedStyle(probe).color;
  probe.remove();
  return computed || null;
}

export function hexToColor(hex: string): ColorValue | null {
  const h = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3,4}$|^[0-9a-fA-F]{6}$|^[0-9a-fA-F]{8}$/.test(h)) return null;

  const expanded =
    h.length === 3 || h.length === 4
      ? h
          .split("")
          .map((char) => char + char)
          .join("")
      : h;

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
    a: expanded.length === 8 ? clampAlpha(parseInt(expanded.slice(6, 8), 16) / 255) : 1,
  };
}

function parseRgbFunction(input: string): ColorValue | null {
  const match = input.match(/^rgba?\((.*)\)$/i);
  if (!match) return null;
  const parts = splitCssFunctionArgs(match[1]);
  if (parts.length < 3) return null;
  return {
    r: parseRgbChannel(parts[0]),
    g: parseRgbChannel(parts[1]),
    b: parseRgbChannel(parts[2]),
    a: parseAlpha(parts[3]),
  };
}

function parseHslFunction(input: string): ColorValue | null {
  const match = input.match(/^hsla?\((.*)\)$/i);
  if (!match) return null;
  const parts = splitCssFunctionArgs(match[1]);
  if (parts.length < 3) return null;
  const h = normalizeHue(parseFloat(parts[0].replace(/deg$/i, "")));
  const s = parsePercent(parts[1]);
  const l = parsePercent(parts[2]);
  const [r, g, b] = hslToRgb(h, s, l);
  return { r, g, b, a: parseAlpha(parts[3]) };
}

export function parseColor(input: string): ColorValue | null {
  const value = input.trim();
  if (!value) return null;
  const named = namedColorToHex(value);
  return (
    hexToColor(value) ??
    parseRgbFunction(value) ??
    parseHslFunction(value) ??
    (named ? hexToColor(named) ?? parseRgbFunction(named) ?? parseHslFunction(named) : null)
  );
}

export function colorToHex(color: ColorValue, includeAlpha = color.a < 1): string {
  const channels = [color.r, color.g, color.b].map((c) => clampByte(c).toString(16).padStart(2, "0"));
  if (includeAlpha) channels.push(clampByte(color.a * 255).toString(16).padStart(2, "0"));
  return `#${channels.join("")}`;
}

export function colorToRgbString(color: ColorValue): string {
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export function colorToRgbaString(color: ColorValue): string {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
}

export function colorToHsl(color: ColorValue): [number, number, number] {
  return rgbToHsl(color.r, color.g, color.b);
}

export function colorToHslString(color: ColorValue): string {
  return formatHslString(colorToHsl(color));
}

export function colorToHslaString(color: ColorValue): string {
  const [h, s, l] = colorToHsl(color);
  return `hsla(${h}, ${s}%, ${l}%, ${color.a})`;
}

function linearChannel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(color: ColorValue): number {
  return 0.2126 * linearChannel(color.r) + 0.7152 * linearChannel(color.g) + 0.0722 * linearChannel(color.b);
}

export function contrastRatio(a: ColorValue, b: ColorValue): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

export function contrastGrade(ratio: number): "AAA" | "AA" | "Fail" {
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "Fail";
}

export function bestTextColor(background: ColorValue): ColorValue {
  const black = { r: 0, g: 0, b: 0, a: 1 };
  const white = { r: 255, g: 255, b: 255, a: 1 };
  return contrastRatio(black, background) >= contrastRatio(white, background) ? black : white;
}

export function mixColors(color: ColorValue, target: ColorValue, amount: number): ColorValue {
  const t = clamp(amount, 0, 1);
  return {
    r: clampByte(color.r + (target.r - color.r) * t),
    g: clampByte(color.g + (target.g - color.g) * t),
    b: clampByte(color.b + (target.b - color.b) * t),
    a: color.a,
  };
}

export function colorScale(color: ColorValue): ColorScaleStep[] {
  const white = { r: 255, g: 255, b: 255, a: color.a };
  const black = { r: 0, g: 0, b: 0, a: color.a };
  const steps: Array<[string, ColorValue]> = [
    ["Tint 80", mixColors(color, white, 0.8)],
    ["Tint 60", mixColors(color, white, 0.6)],
    ["Tint 40", mixColors(color, white, 0.4)],
    ["Tint 20", mixColors(color, white, 0.2)],
    ["Base", color],
    ["Shade 15", mixColors(color, black, 0.15)],
    ["Shade 30", mixColors(color, black, 0.3)],
    ["Shade 45", mixColors(color, black, 0.45)],
    ["Shade 60", mixColors(color, black, 0.6)],
  ];
  return steps.map(([label, stepColor]) => ({ label, color: stepColor, hex: colorToHex(stepColor, color.a < 1).toUpperCase() }));
}

export function cssVariable(name: string, value: string): string {
  const normalized = name.trim() || "brand";
  return `--color-${normalized}: ${value};`;
}

export function previewBackground(color: ColorValue): string {
  return colorToCss(color);
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const color = hexToColor(hex);
  return color ? [color.r, color.g, color.b] : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return colorToHex({ r, g, b, a: 1 });
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r
      ? ((g - b) / d + (g < b ? 6 : 0)) / 6
      : max === g
        ? ((b - r) / d + 2) / 6
        : ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = normalizeHue(h) / 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

export function formatRgbString(rgb: [number, number, number]): string {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

export function formatHslString(hsl: [number, number, number]): string {
  return `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
}
