/**
 * JSON ↔ YAML converter. Single place for conversion logic and constants.
 */

import { parse as parseYaml } from "yaml";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export type JsonYamlDirection = "json-to-yaml" | "yaml-to-json";

/** File accept when input is JSON. */
export const JSON_YAML_FILE_ACCEPT_JSON = ".json,application/json";
/** File accept when input is YAML. */
export const JSON_YAML_FILE_ACCEPT_YAML = ".yaml,.yml,application/x-yaml,text/yaml";
export const JSON_YAML_SAMPLE_JSON = '{"key": "value", "nested": {"a": 1}, "list": [1, 2, 3]}';
export const JSON_YAML_SAMPLE_YAML = `key: value
nested:
  a: 1
list:
  - 1
  - 2
  - 3`;
export const JSON_YAML_PLACEHOLDER_JSON = '{"key": "value"}';
export const JSON_YAML_PLACEHOLDER_YAML = "key: value";
export const JSON_YAML_PLACEHOLDER_OUTPUT = "Result will appear here...";
export const JSON_YAML_OUTPUT_FILENAME_YAML = "output.yaml";
export const JSON_YAML_OUTPUT_FILENAME_JSON = "output.json";
export const JSON_YAML_MIME_TYPE_YAML = "application/x-yaml";
export const JSON_YAML_MIME_TYPE_JSON = "application/json";

/** @deprecated Use direction-based constants. */
export const JSON_YAML_FILE_ACCEPT = JSON_YAML_FILE_ACCEPT_JSON;
/** @deprecated Use JSON_YAML_OUTPUT_FILENAME_YAML or _JSON by direction. */
export const JSON_YAML_OUTPUT_FILENAME = JSON_YAML_OUTPUT_FILENAME_YAML;
/** @deprecated Use JSON_YAML_MIME_TYPE_YAML or _JSON by direction. */
export const JSON_YAML_MIME_TYPE = JSON_YAML_MIME_TYPE_YAML;
/** @deprecated Use input language by direction. */
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

/** Format YAML input to JSON; returns output and optional parse errors for TwoPanelToolLayout. */
export function processYamlToJson(input: string, spacesPerLevel: number): JsonYamlFormatResult {
  if (!input.trim()) return { output: "", errors: [] };
  try {
    const parsed = parseYaml(input, { strict: false });
    const indent = spacesPerLevel <= 0 ? 0 : spacesPerLevel;
    const output = indent > 0 ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
    return { output, errors: [] };
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
