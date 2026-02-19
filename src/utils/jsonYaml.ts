/**
 * JSON ↔ YAML converter. Single place for conversion logic and constants.
 */

import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export const JSON_YAML_FILE_ACCEPT = ".json,application/json";
export const JSON_YAML_SAMPLE_JSON = '{"key": "value", "nested": {"a": 1}, "list": [1, 2, 3]}';
export const JSON_YAML_PLACEHOLDER_INPUT = '{"key": "value"}';
export const JSON_YAML_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const JSON_YAML_OUTPUT_FILENAME = "output.yaml";
export const JSON_YAML_MIME_TYPE = "application/x-yaml";
export const JSON_YAML_LANGUAGE = "json";

export interface JsonYamlFormatResult {
  output: string;
  errors?: ParseError[];
}

/** Format JSON input to YAML; returns output and optional parse errors for TwoPanelToolLayout. */
export function processJsonToYaml(input: string, spacesPerLevel: number): JsonYamlFormatResult {
  if (!input.trim()) return { output: "", errors: [] };
  try {
    const parsed = JSON.parse(input);
    return { output: jsonToYaml(parsed, 0, spacesPerLevel), errors: [] };
  } catch (e) {
    return { output: "", errors: singleErrorToParseErrors((e as Error).message) };
  }
}

export function jsonToYaml(obj: unknown, depth = 0, spacesPerLevel = 2): string {
  const pad = " ".repeat(spacesPerLevel * depth);
  if (obj === null) return "null";
  if (typeof obj === "boolean" || typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    if (obj.includes("\n") || obj.includes(":") || obj.includes("#") || obj.includes("'") || obj.includes('"')) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj
      .map((item) => {
        const val = jsonToYaml(item, depth + 1, spacesPerLevel);
        if (typeof item === "object" && item !== null) return `${pad}- ${val.trimStart()}`;
        return `${pad}- ${val}`;
      })
      .join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries
      .map(([key, val]) => {
        const yamlVal = jsonToYaml(val, depth + 1, spacesPerLevel);
        if (typeof val === "object" && val !== null && !Array.isArray(val)) return `${pad}${key}:\n${yamlVal}`;
        if (Array.isArray(val)) return `${pad}${key}:\n${yamlVal}`;
        return `${pad}${key}: ${yamlVal}`;
      })
      .join("\n");
  }
  return String(obj);
}
