export type EditorFontOption = {
  value: string;
  label: string;
  family: string;
};

export const DEFAULT_EDITOR_FONT = "system";

export const DEFAULT_EDITOR_FONT_FAMILY =
  'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace';

export const LEGACY_EDITOR_FONT = "ui-monospace, ui-serif, monospace";

export const EDITOR_FONTS: EditorFontOption[] = [
  { value: DEFAULT_EDITOR_FONT, label: "System monospace", family: DEFAULT_EDITOR_FONT_FAMILY },
  {
    value: "menlo-monaco",
    label: "Menlo / Monaco",
    family: 'Menlo, Monaco, "SF Mono", Consolas, "Liberation Mono", monospace',
  },
  {
    value: "cascadia-code",
    label: "Cascadia Code",
    family: '"Cascadia Code", "Cascadia Mono", Consolas, "Liberation Mono", monospace',
  },
  {
    value: "jetbrains-mono",
    label: "JetBrains Mono",
    family: '"JetBrains Mono", "SF Mono", Consolas, "Liberation Mono", monospace',
  },
  {
    value: "fira-code",
    label: "Fira Code",
    family: '"Fira Code", "SF Mono", Consolas, "Liberation Mono", monospace',
  },
  {
    value: "ibm-plex-mono",
    label: "IBM Plex Mono",
    family: '"IBM Plex Mono", "SF Mono", Consolas, "Liberation Mono", monospace',
  },
  {
    value: "source-code-pro",
    label: "Source Code Pro",
    family: '"Source Code Pro", "SF Mono", Consolas, "Liberation Mono", monospace',
  },
  {
    value: "roboto-mono",
    label: "Roboto Mono",
    family: '"Roboto Mono", "SF Mono", Consolas, "Liberation Mono", monospace',
  },
  { value: "courier-new", label: "Courier New", family: '"Courier New", Courier, monospace' },
];

export function isKnownEditorFont(value: unknown): value is string {
  return typeof value === "string" && EDITOR_FONTS.some((font) => font.value === value);
}

export function getEditorFontFamily(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_EDITOR_FONT_FAMILY;
  return (
    EDITOR_FONTS.find((font) => font.value === value || font.family === value)?.family ??
    DEFAULT_EDITOR_FONT_FAMILY
  );
}

export function normalizeEditorFont(value: unknown): string {
  if (value === LEGACY_EDITOR_FONT) return DEFAULT_EDITOR_FONT;
  if (typeof value !== "string") return DEFAULT_EDITOR_FONT;
  return (
    EDITOR_FONTS.find((font) => font.value === value || font.family === value)?.value ??
    DEFAULT_EDITOR_FONT
  );
}
