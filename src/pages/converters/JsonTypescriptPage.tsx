import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

type Lang = "typescript" | "go" | "java" | "kotlin";

const inferType = (val: unknown): string => {
  if (val === null) return "null";
  if (Array.isArray(val)) {
    if (val.length === 0) return "any[]";
    return inferType(val[0]) + "[]";
  }
  return typeof val;
};

const jsonToTs = (obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string => {
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
};

const jsonToGo = (obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string => {
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
};

const jsonToJava = (obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string => {
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
};

const jsonToKotlin = (obj: Record<string, unknown>, name = "Root", indent = 2, depth = 0): string => {
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
};

const langs: { value: Lang; label: string; editorLang: "typescript" | "go" | "java" | "kotlin" }[] = [
  { value: "typescript", label: "TypeScript", editorLang: "typescript" },
  { value: "go", label: "Go", editorLang: "go" },
  { value: "java", label: "Java", editorLang: "java" },
  { value: "kotlin", label: "Kotlin", editorLang: "kotlin" },
];

const JsonTypescriptPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(`{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "NYC"
  },
  "tags": ["admin", "user"]
}`);
  const [lang, setLang] = useState<Lang>("typescript");
  const [indent, setIndent] = useState(2);

  const converters: Record<Lang, (obj: Record<string, unknown>) => string> = useMemo(() => ({
    typescript: (obj) => jsonToTs(obj, "Root", indent),
    go: (obj) => jsonToGo(obj, "Root", indent),
    java: (obj) => jsonToJava(obj, "Root", indent),
    kotlin: (obj) => jsonToKotlin(obj, "Root", indent),
  }), [indent]);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("Input must be a JSON object");
      }
      return { output: converters[lang](parsed), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, lang, converters]);

  const currentLang = langs.find(l => l.value === lang)!;

  return (
    <ToolLayout title={tool?.label ?? "JSON → Types"} description={tool?.description ?? "Generate TypeScript types from JSON"}>
      <div className="tool-toolbar">
        {langs.map((l) => (
          <button
            key={l.value}
            onClick={() => setLang(l.value)}
            className={`px-2.5 py-1 text-xs rounded border transition-colors ${lang === l.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"}`}
          >
            {l.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Indent:</label>
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="tool-select">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="JSON Input" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="json" />
        </div>
        <div className="tool-panel">
          <PanelHeader label={`${currentLang.label} Output`} text={output} />
          {error ? (
            <div className="code-block text-destructive flex-1">{error}</div>
          ) : (
            <CodeEditor value={output} readOnly language={currentLang.editorLang} placeholder="Result will appear here..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonTypescriptPage;
