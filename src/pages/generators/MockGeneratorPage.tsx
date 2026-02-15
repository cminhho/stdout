import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

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

const defaultSchema = `{
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
  const [schema, setSchema] = useState(defaultSchema);
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const generate = useCallback(() => {
    try {
      const parsed = JSON.parse(schema);
      const items = Array.from({ length: count }, () => generateFromSchema(parsed));
      setOutput(JSON.stringify(count === 1 ? items[0] : items, null, 2));
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
      setOutput("");
    }
  }, [schema, count]);

  return (
    <ToolLayout title={tool?.label ?? "Mock Payload"} description={tool?.description ?? "Generate mock JSON data from a schema"}>
      <div className="flex flex-col flex-1 min-h-0">
      <div className="flex gap-2 items-center mb-3 flex-wrap shrink-0">
        <label className="text-xs text-muted-foreground">Count:</label>
        <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="input-compact w-16" />
        <Button size="xs" onClick={generate}>Generate</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Schema Template" text={schema} onClear={() => { setSchema(""); setOutput(""); setError(""); }} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={schema} onChange={setSchema} language="json" placeholder='{"id": "uuid", "name": "string", ...}' fillHeight />
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 space-y-0.5 shrink-0">
            <p>Types: <code className="text-primary">string, number, boolean, email, uuid, date, url, null</code> · Arrays <code className="text-primary">["type"]</code> · Nested objects</p>
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} />
          {error && <div className="code-block text-destructive text-xs shrink-0">⚠ {error}</div>}
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output || ""} readOnly language="json" placeholder="Generated data will appear here..." fillHeight />
          </div>
        </div>
      </div>
      </div>
    </ToolLayout>
  );
};

export default MockGeneratorPage;
