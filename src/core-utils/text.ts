/**
 * Core text utilities — pure functions.
 */

export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

export const analyzeText = (text: string): TextStats => ({
  characters: text.length,
  words: text.trim() ? text.trim().split(/\s+/).length : 0,
  sentences: text.trim() ? (text.match(/[.!?]+/g) || []).length : 0,
  paragraphs: text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0,
  lines: text.split("\n").length,
});

// ── String case transformers ──────────────────────────────────────────

export const toCamelCase = (s: string): string =>
  s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^[A-Z]/, (c) => c.toLowerCase());

export const toPascalCase = (s: string): string =>
  toCamelCase(s).replace(/^./, (c) => c.toUpperCase());

export const toSnakeCase = (s: string): string =>
  s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase();

export const toKebabCase = (s: string): string =>
  s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase();

export const toConstantCase = (s: string): string =>
  toSnakeCase(s).toUpperCase();

export const toTitleCase = (s: string): string =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());
