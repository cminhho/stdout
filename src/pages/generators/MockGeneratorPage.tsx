import { useState, useCallback, useEffect } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ToolAlert from "@/components/ToolAlert";

function randomString(len = 8): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(len)), (b) => b.toString(36)).join("").slice(0, len);
}
function randomInt(min = 0, max = 1000): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomEmail(): string {
  return `${randomString(6)}@${randomString(4)}.com`;
}
function randomDate(): string {
  const d = new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000);
  return d.toISOString();
}

function generateFromSchema(schema: unknown): unknown {
  if (schema === null || schema === undefined) return null;
  if (typeof schema === "string") {
    const s = schema.toLowerCase();
    if (s === "string") return randomString(10);
    if (s === "number" || s === "integer" || s === "int") return randomInt();
    if (s === "boolean" || s === "bool") return Math.random() > 0.5;
    if (s === "email") return randomEmail();
    if (s === "date" || s === "datetime" || s === "timestamp") return randomDate();
    if (s === "uuid" || s === "id") return crypto.randomUUID();
    if (s === "url") return `https://${randomString(6)}.com/${randomString(4)}`;
    if (s === "null") return null;
    return randomString();
  }
  if (Array.isArray(schema)) {
    const itemSchema = schema[0] ?? "string";
    const count = randomInt(1, 4);
    return Array.from({ length: count }, () => generateFromSchema(itemSchema));
  }
  if (typeof schema === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(schema as Record<string, unknown>)) {
      result[key] = generateFromSchema(val);
    }
    return result;
  }
  return null;
}

const SAMPLE_SCHEMA = `{
  "id": "uuid",
  "name": "string",
  "email": "email",
  "age": "number",
  "active": "boolean",
  "created_at": "datetime",
  "tags": ["string"],
  "address": {
    "street": "string",
    "city": "string",
    "zip": "string"
  }
}`;

const MockGeneratorPage = () => {
  const tool = useCurrentTool();
  const [schema, setSchema] = useState(SAMPLE_SCHEMA);
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const setSchemaAndClear = useCallback((v: string) => {
    setSchema(v);
    setOutput("");
    setError("");
  }, []);

  const generate = useCallback(() => {
    try {
      const parsed = JSON.parse(schema);
      const items = Array.from({ length: count }, () => generateFromSchema(parsed));
      const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
      setOutput(JSON.stringify(count === 1 ? items[0] : items, null, space));
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setOutput("");
    }
  }, [schema, count, indent]);

  useEffect(() => {
    if (!output.trim()) return;
    try {
      const parsed = JSON.parse(output);
      const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
      setOutput(JSON.stringify(parsed, null, space));
    } catch {
      // leave as-is
    }
  }, [indent]);

  const outputPaneContent = (
    <div className="flex flex-col flex-1 min-h-0 gap-2">
      {error && <ToolAlert variant="error" message={error} prefix="⚠ " className="shrink-0" />}
      <div className="flex-1 min-h-0 flex flex-col">
        <CodeEditor value={output || ""} readOnly language="json" placeholder="Generated data will appear here..." fillHeight />
      </div>
    </div>
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? "Mock Payload"}
      description={tool?.description ?? "Generate mock JSON data from a schema"}
      inputPane={{
        title: "Schema Template",
        inputToolbar: {
          onSample: () => setSchemaAndClear(SAMPLE_SCHEMA),
          setInput: setSchemaAndClear,
          fileAccept: ".json,application/json",
          onFileText: setSchemaAndClear,
        },
        inputEditor: {
          value: schema,
          onChange: setSchema,
          language: "json",
          placeholder: '{"id": "uuid", "name": "string", ...}',
        },
        children: undefined,
      }}
      outputPane={{
        title: "Output",
        copyText: output || undefined,
        toolbar: (
          <div className="flex items-center gap-2 flex-wrap">
            <IndentSelect value={indent} onChange={setIndent} />
            <label className="text-xs text-muted-foreground shrink-0">Count</label>
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="h-7 w-14 font-mono text-xs"
            />
            <Button size="xs" onClick={generate}>
              Generate
            </Button>
          </div>
        ),
        children: outputPaneContent,
      }}
    />
  );
};

export default MockGeneratorPage;
