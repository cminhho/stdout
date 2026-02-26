/**
 * JSON → TypeScript/Go/Java/Kotlin types. Single place for conversion logic and constants.
 */

import type { IndentOption } from "@/components/common/IndentSelect";
import type { ParseError } from "@/utils/validationTypes";
import { singleErrorToParseErrors } from "@/utils/validationTypes";

export type JsonTypescriptLang = "typescript" | "go" | "java" | "kotlin";

export const JSON_TYPESCRIPT_FILE_ACCEPT = ".json,application/json";
export const JSON_TYPESCRIPT_PLACEHOLDER_INPUT = "Paste JSON object...";
export const JSON_TYPESCRIPT_OUTPUT_FILENAME = "types.ts";
export const JSON_TYPESCRIPT_MIME_TYPE = "text/plain";

export const JSON_TYPESCRIPT_SAMPLE = `{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "NYC"
  },
  "tags": ["admin", "user"]
}`;
export const JSON_TYPESCRIPT_PLACEHOLDER_OUTPUT = "Result will appear here...";

export const JSON_TYPESCRIPT_LANGS: { value: JsonTypescriptLang; label: string; editorLang: "typescript" | "go" | "java" | "kotlin" }[] = [
  { value: "typescript", label: "TypeScript", editorLang: "typescript" },
  { value: "go", label: "Go", editorLang: "go" },
  { value: "java", label: "Java", editorLang: "java" },
  { value: "kotlin", label: "Kotlin", editorLang: "kotlin" },
];

function inferType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) {
    if (val.length === 0) return "any[]";
    return inferType(val[0]) + "[]";
  }
  return typeof val;
}

export function jsonToTs(obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string {
  const pad = " ".repeat(indent).repeat(depth);
  const innerPad = " ".repeat(indent).repeat(depth + 1);
  const lines: string[] = [`${pad}interface ${name} {`];
  const nested: string[] = [];
  for (const [key, val] of Object.entries(obj)) {
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      const typeName = key.charAt(0).toUpperCase() + key.slice(1);
      lines.push(`${innerPad}${key}: ${typeName};`);
      nested.push(jsonToTs(val as Record<string, unknown>, typeName, indent, depth));
    } else if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
      const typeName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
      lines.push(`${innerPad}${key}: ${typeName}[];`);
      nested.push(jsonToTs(val[0] as Record<string, unknown>, typeName, indent, depth));
    } else {
      lines.push(`${innerPad}${key}: ${inferType(val)};`);
    }
  }
  lines.push(`${pad}}`);
  return [...nested, lines.join("\n")].join("\n\n");
}

export function jsonToGo(obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string {
  const tab = " ".repeat(indent);
  const pad = tab.repeat(depth);
  const innerPad = tab.repeat(depth + 1);
  const lines: string[] = [`${pad}type ${name} struct {`];
  const nested: string[] = [];
  const goType = (val: unknown, key: string): string => {
    if (val === null) return "interface{}";
    if (typeof val === "string") return "string";
    if (typeof val === "number") return Number.isInteger(val) ? "int" : "float64";
    if (typeof val === "boolean") return "bool";
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
        const typeName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
        nested.push(jsonToGo(val[0] as Record<string, unknown>, typeName, indent, depth));
        return `[]${typeName}`;
      }
      return val.length > 0 ? `[]${goType(val[0], key)}` : "[]interface{}";
    }
    if (typeof val === "object") {
      const typeName = key.charAt(0).toUpperCase() + key.slice(1);
      nested.push(jsonToGo(val as Record<string, unknown>, typeName, indent, depth));
      return typeName;
    }
    return "interface{}";
  };
  for (const [key, val] of Object.entries(obj)) {
    const goKey = key.charAt(0).toUpperCase() + key.slice(1);
    lines.push(`${innerPad}${goKey} ${goType(val, key)} \`json:"${key}"\``);
  }
  lines.push(`${pad}}`);
  return [...nested, lines.join("\n")].join("\n\n");
}

export function jsonToJava(obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string {
  const tab = " ".repeat(indent);
  const pad = tab.repeat(depth);
  const innerPad = tab.repeat(depth + 1);
  const lines: string[] = [`${pad}public class ${name} {`];
  const nested: string[] = [];
  const javaType = (val: unknown, key: string): string => {
    if (val === null) return "Object";
    if (typeof val === "string") return "String";
    if (typeof val === "number") return Number.isInteger(val) ? "int" : "double";
    if (typeof val === "boolean") return "boolean";
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
        const typeName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
        nested.push(jsonToJava(val[0] as Record<string, unknown>, typeName, indent, depth + 1));
        return `List<${typeName}>`;
      }
      return val.length > 0 ? `List<${javaType(val[0], key).replace(/^int$/, "Integer").replace(/^double$/, "Double").replace(/^boolean$/, "Boolean")}>` : "List<Object>";
    }
    if (typeof val === "object") {
      const typeName = key.charAt(0).toUpperCase() + key.slice(1);
      nested.push(jsonToJava(val as Record<string, unknown>, typeName, indent, depth + 1));
      return typeName;
    }
    return "Object";
  };
  for (const [key, val] of Object.entries(obj)) {
    lines.push(`${innerPad}private ${javaType(val, key)} ${key};`);
  }
  lines.push(`${pad}}`);
  return [lines.join("\n"), ...nested].join("\n\n");
}

export function jsonToKotlin(obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string {
  const tab = " ".repeat(indent);
  const pad = tab.repeat(depth);
  const innerPad = tab.repeat(depth + 1);
  const nested: string[] = [];
  const fields: string[] = [];
  const ktType = (val: unknown, key: string): string => {
    if (val === null) return "Any?";
    if (typeof val === "string") return "String";
    if (typeof val === "number") return Number.isInteger(val) ? "Int" : "Double";
    if (typeof val === "boolean") return "Boolean";
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
        const typeName = key.charAt(0).toUpperCase() + key.slice(1) + "Item";
        nested.push(jsonToKotlin(val[0] as Record<string, unknown>, typeName, indent, depth));
        return `List<${typeName}>`;
      }
      return val.length > 0 ? `List<${ktType(val[0], key)}>` : "List<Any>";
    }
    if (typeof val === "object") {
      const typeName = key.charAt(0).toUpperCase() + key.slice(1);
      nested.push(jsonToKotlin(val as Record<string, unknown>, typeName, indent, depth));
      return typeName;
    }
    return "Any";
  };
  for (const [key, val] of Object.entries(obj)) {
    fields.push(`${innerPad}val ${key}: ${ktType(val, key)}`);
  }
  const result = `${pad}data class ${name}(\n${fields.join(",\n")}\n${pad})`;
  return [...nested, result].join("\n\n");
}

const space = (indent: number): number => (typeof indent === "number" ? indent : 2);

export function processJsonToTypes(
  input: string,
  lang: JsonTypescriptLang,
  indent: number
): { output: string; error: string } {
  if (!input.trim()) return { output: "", error: "" };
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Input must be a JSON object");
    }
    const sp = space(indent);
    const obj = parsed as Record<string, unknown>;
    const output =
      lang === "typescript"
        ? jsonToTs(obj, "Root", sp)
        : lang === "go"
          ? jsonToGo(obj, "Root", sp)
          : lang === "java"
            ? jsonToJava(obj, "Root", sp)
            : jsonToKotlin(obj, "Root", sp);
    return { output, error: "" };
  } catch (e) {
    return { output: "", error: (e as Error).message };
  }
}

export interface JsonTypescriptFormatResult {
  output: string;
  errors?: ParseError[];
}

export function processJsonToTypesForLayout(
  input: string,
  indent: IndentOption,
  lang: JsonTypescriptLang
): JsonTypescriptFormatResult {
  const indentNum = typeof indent === "number" ? indent : 2;
  const { output, error } = processJsonToTypes(input, lang, indentNum);
  if (error) return { output: "", errors: singleErrorToParseErrors(error) };
  return { output, errors: [] };
}
