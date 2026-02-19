import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

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

const SAMPLE_JSON = `{
  "id": 1,
  "name": "John",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "NYC"
  },
  "tags": ["admin", "user"]
}`;

const JsonTypescriptPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(SAMPLE_JSON);
  const [lang, setLang] = useState<Lang>("typescript");
  const [indent, setIndent] = useState<IndentOption>(2);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file));
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const converters: Record<Lang, (obj: Record<string, unknown>) => string> = useMemo(() => ({
    typescript: (obj) => jsonToTs(obj, "Root", typeof indent === "number" ? indent : 2),
    go: (obj) => jsonToGo(obj, "Root", typeof indent === "number" ? indent : 2),
    java: (obj) => jsonToJava(obj, "Root", typeof indent === "number" ? indent : 2),
    kotlin: (obj) => jsonToKotlin(obj, "Root", typeof indent === "number" ? indent : 2),
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="JSON Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_JSON)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="json" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={`${currentLang.label} Output`}
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className={selectClass}>
                  {langs.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>
                <IndentSelect
                  value={indent}
                  onChange={setIndent}
                  includeTab={false}
                  includeMinified={false}
                  className={selectClass}
                />
              </div>
            }
          />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language={currentLang.editorLang} placeholder="Result will appear here..." fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonTypescriptPage;
