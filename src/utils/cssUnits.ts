/**
 * CSS units conversion (px, rem, em, vw, vh, etc.). Single place for conversion logic.
 */

export const CSS_UNITS_LIST = ["px", "rem", "em", "pt", "vw", "vh", "%", "cm", "mm", "in"] as const;
export type CssUnit = (typeof CSS_UNITS_LIST)[number];

export const CSS_UNITS_DEFAULT_BASE = 16;

type Viewport = { width: number; height: number };

export function toPx(
  value: number,
  fromUnit: string,
  baseFontSize: number,
  viewport: Viewport
): number {
  switch (fromUnit) {
    case "px":
      return value;
    case "rem":
    case "em":
      return value * baseFontSize;
    case "pt":
      return value / 0.75;
    case "vw":
      return (value / 100) * viewport.width;
    case "vh":
      return (value / 100) * viewport.height;
    case "%":
      return value;
    case "cm":
      return value * 37.7953;
    case "mm":
      return value * 3.77953;
    case "in":
      return value * 96;
    default:
      return value;
  }
}

type PxToUnitFn = (v: number, base: number, viewport: Viewport) => number;

const pxToUnitConverters: Record<string, PxToUnitFn> = {
  rem: (v, base) => v / base,
  em: (v, base) => v / base,
  pt: (v) => v * 0.75,
  vw: (v, _, viewport) => (v / viewport.width) * 100,
  vh: (v, _, viewport) => (v / viewport.height) * 100,
  "%": (v) => v,
  cm: (v) => v / 37.7953,
  mm: (v) => v / 3.77953,
  in: (v) => v / 96,
};

export function pxToUnit(
  px: number,
  unit: string,
  baseFontSize: number,
  viewport: Viewport
): number {
  if (unit === "px") return px;
  const fn = pxToUnitConverters[unit];
  if (!fn) return px;
  return fn(px, baseFontSize, viewport);
}

export interface CssUnitResult {
  unit: string;
  value: number;
}

export function convertToAllUnits(
  value: number,
  fromUnit: string,
  baseFontSize: number,
  viewport: Viewport
): CssUnitResult[] {
  const pxVal = toPx(value, fromUnit, baseFontSize, viewport);
  return CSS_UNITS_LIST.filter((u) => u !== fromUnit).map((u) => ({
    unit: u,
    value: Number(pxToUnit(pxVal, u, baseFontSize, viewport).toFixed(4)),
  }));
}
