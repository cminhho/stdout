/**
 * Number base conversion (binary, octal, decimal, hex). Single place for logic and constants.
 */

export interface NumberBaseOption {
  label: string;
  radix: number;
}

export const NUMBER_BASE_OPTIONS: NumberBaseOption[] = [
  { label: "Binary (2)", radix: 2 },
  { label: "Octal (8)", radix: 8 },
  { label: "Decimal (10)", radix: 10 },
  { label: "Hexadecimal (16)", radix: 16 },
];

export const NUMBER_BASE_PLACEHOLDER = "Enter a number...";

export function parseFromBase(input: string, fromBase: number): number | null {
  try {
    const n = parseInt(input.trim(), fromBase);
    if (isNaN(n)) return null;
    return n;
  } catch {
    return null;
  }
}

export function convertToAllBases(value: number): (NumberBaseOption & { value: string })[] {
  return NUMBER_BASE_OPTIONS.map((b) => ({
    ...b,
    value: value.toString(b.radix).toUpperCase(),
  }));
}
