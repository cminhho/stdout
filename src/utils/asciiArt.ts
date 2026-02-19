/**
 * ASCII art generator. Single place for font data and conversion logic.
 */

export const ASCII_ART_FILE_ACCEPT = ".txt,text/plain";
export const ASCII_ART_SAMPLE = "HELLO";
export const ASCII_ART_PLACEHOLDER_INPUT = "Enter text...";
export const ASCII_ART_PLACEHOLDER_OUTPUT = "Type in the left panel...";
export const ASCII_ART_OUTPUT_FILENAME = "ascii-art.txt";
export const ASCII_ART_MIME_TYPE = "text/plain";

export type AsciiArtCharStyle = "block" | "hash" | "asterisk" | "at" | "dollar" | "plus";

export const ASCII_ART_CHAR_STYLES: { value: AsciiArtCharStyle; label: string }[] = [
  { value: "block", label: "█ Block" },
  { value: "hash", label: "# Hash" },
  { value: "asterisk", label: "* Asterisk" },
  { value: "at", label: "@ At" },
  { value: "dollar", label: "$ Dollar" },
  { value: "plus", label: "+ Plus" },
];

export const ASCII_ART_SPACING_OPTIONS = [
  { value: 1, label: "Tight" },
  { value: 2, label: "Normal" },
  { value: 4, label: "Wide" },
];

const FONT: Record<string, string[]> = {
  A: ["  ██  ", " █  █ ", "█    █", "██████", "█    █", "█    █"],
  B: ["█████ ", "█    █", "█████ ", "█    █", "█    █", "█████ "],
  C: [" ████ ", "█    █", "█     ", "█     ", "█    █", " ████ "],
  D: ["████  ", "█   █ ", "█    █", "█    █", "█   █ ", "████  "],
  E: ["██████", "█     ", "████  ", "█     ", "█     ", "██████"],
  F: ["██████", "█     ", "████  ", "█     ", "█     ", "█     "],
  G: [" ████ ", "█     ", "█  ███", "█    █", "█    █", " ████ "],
  H: ["█    █", "█    █", "██████", "█    █", "█    █", "█    █"],
  I: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  ", "██████"],
  J: ["   ███", "    █ ", "    █ ", "    █ ", "█   █ ", " ███  "],
  K: ["█   █ ", "█  █  ", "███   ", "█  █  ", "█   █ ", "█    █"],
  L: ["█     ", "█     ", "█     ", "█     ", "█     ", "██████"],
  M: ["█    █", "██  ██", "█ ██ █", "█    █", "█    █", "█    █"],
  N: ["█    █", "██   █", "█ █  █", "█  █ █", "█   ██", "█    █"],
  O: [" ████ ", "█    █", "█    █", "█    █", "█    █", " ████ "],
  P: ["█████ ", "█    █", "█████ ", "█     ", "█     ", "█     "],
  Q: [" ████ ", "█    █", "█    █", "█  █ █", "█   █ ", " ███ █"],
  R: ["█████ ", "█    █", "█████ ", "█  █  ", "█   █ ", "█    █"],
  S: [" ████ ", "█     ", " ████ ", "     █", "     █", "█████ "],
  T: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
  U: ["█    █", "█    █", "█    █", "█    █", "█    █", " ████ "],
  V: ["█    █", "█    █", "█    █", " █  █ ", " █  █ ", "  ██  "],
  W: ["█    █", "█    █", "█    █", "█ ██ █", "██  ██", "█    █"],
  X: ["█    █", " █  █ ", "  ██  ", "  ██  ", " █  █ ", "█    █"],
  Y: ["█    █", " █  █ ", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
  Z: ["██████", "    █ ", "   █  ", "  █   ", " █    ", "██████"],
  "0": [" ████ ", "█   ██", "█  █ █", "█ █  █", "██   █", " ████ "],
  "1": ["  █   ", " ██   ", "  █   ", "  █   ", "  █   ", " ███  "],
  "2": [" ████ ", "█    █", "    █ ", "  ██  ", " █    ", "██████"],
  "3": [" ████ ", "█    █", "   ██ ", "     █", "█    █", " ████ "],
  "4": ["   █  ", "  ██  ", " █ █  ", "█  █  ", "██████", "   █  "],
  "5": ["██████", "█     ", "█████ ", "     █", "     █", "█████ "],
  "6": [" ████ ", "█     ", "█████ ", "█    █", "█    █", " ████ "],
  "7": ["██████", "    █ ", "   █  ", "  █   ", " █    ", "█     "],
  "8": [" ████ ", "█    █", " ████ ", "█    █", "█    █", " ████ "],
  "9": [" ████ ", "█    █", " █████", "     █", "    █ ", " ███  "],
  " ": ["      ", "      ", "      ", "      ", "      ", "      "],
  "!": ["  ██  ", "  ██  ", "  ██  ", "  ██  ", "      ", "  ██  "],
  "?": [" ████ ", "█    █", "   ██ ", "  █   ", "      ", "  █   "],
  ".": ["      ", "      ", "      ", "      ", "      ", "  ██  "],
  ",": ["      ", "      ", "      ", "      ", "  ██  ", " ██   "],
  "-": ["      ", "      ", " ████ ", "      ", "      ", "      "],
  _: ["      ", "      ", "      ", "      ", "      ", "██████"],
  "@": [" ████ ", "█    █", "█ ██ █", "█ ████", "█     ", " ████ "],
  "#": [" █ █  ", "██████", " █ █  ", " █ █  ", "██████", " █ █  "],
};

const CHAR_MAP: Record<AsciiArtCharStyle, string> = {
  block: "█",
  hash: "#",
  asterisk: "*",
  at: "@",
  dollar: "$",
  plus: "+",
};

export interface AsciiArtFormatResult {
  output: string;
}

export function processAsciiArtForLayout(
  input: string,
  charStyle: AsciiArtCharStyle,
  spacing: number
): AsciiArtFormatResult {
  if (!input.trim()) return { output: "" };
  const text = input.toUpperCase();
  const lines: string[] = ["", "", "", "", "", ""];
  const spacer = " ".repeat(spacing);
  const ch = CHAR_MAP[charStyle] ?? "█";

  for (const char of text) {
    const glyph = FONT[char];
    if (glyph) {
      for (let row = 0; row < 6; row++) {
        lines[row] += (lines[row] ? spacer : "") + glyph[row].replace(/█/g, ch);
      }
    }
  }
  return { output: lines.join("\n") };
}
