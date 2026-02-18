import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/CopyButton";
import { Upload, FileCode, Eraser } from "lucide-react";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const readFileAsText = (file: File, encoding: FileEncoding): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      if (result instanceof ArrayBuffer) {
        const enc = encoding === "utf-16le" ? "utf-16le" : encoding === "utf-16be" ? "utf-16be" : "utf-8";
        resolve(new TextDecoder(enc).decode(result));
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    if (encoding === "utf-8") {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";
const SAMPLE_A = '{"id": 1, "name": "test", "roles": ["admin"]}';
const SAMPLE_B = '{"id": "1", "email": "x@y.z", "roles": ["user"]}';

interface DiffEntry {
  path: string;
  type: "added" | "removed" | "changed";
  oldValue?: string;
  newValue?: string;
}

function getType(val: unknown): string {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val;
}

function diffObjects(a: unknown, b: unknown, path = ""): DiffEntry[] {
  const entries: DiffEntry[] = [];
  const typeA = getType(a);
  const typeB = getType(b);
  if (typeA !== typeB) {
    entries.push({ path: path || "(root)", type: "changed", oldValue: typeA, newValue: typeB });
    return entries;
  }
  if (typeA === "object" && a !== null && b !== null) {
    const oa = a as Record<string, unknown>, ob = b as Record<string, unknown>;
    const keysA = new Set(Object.keys(oa));
    const keysB = new Set(Object.keys(ob));
    for (const key of keysB) {
      if (!keysA.has(key)) entries.push({ path: path ? `${path}.${key}` : key, type: "added", newValue: getType(ob[key]) });
    }
    for (const key of keysA) {
      if (!keysB.has(key)) entries.push({ path: path ? `${path}.${key}` : key, type: "removed", oldValue: getType(oa[key]) });
    }
    for (const key of keysA) {
      if (keysB.has(key)) entries.push(...diffObjects(oa[key], ob[key], path ? `${path}.${key}` : key));
    }
  } else if (typeA === "array" && Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) entries.push({ path: p, type: "added", newValue: getType(b[i]) });
      else if (i >= b.length) entries.push({ path: p, type: "removed", oldValue: getType(a[i]) });
      else entries.push(...diffObjects(a[i], b[i], p));
    }
  }
  return entries;
}

const SchemaDiffPage = () => {
  const tool = useCurrentTool();
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const handleLeftUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLeft(await readFileAsText(file, fileEncoding));
    } catch {
      setLeft("");
    }
    e.target.value = "";
  };
  const handleRightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setRight(await readFileAsText(file, fileEncoding));
    } catch {
      setRight("");
    }
    e.target.value = "";
  };

  const leftExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setLeft(SAMPLE_A)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setLeft("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={leftInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleLeftUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => leftInputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
      <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass} title="File encoding">
        <option value="utf-8">UTF-8</option>
        <option value="utf-16le">UTF-16 LE</option>
        <option value="utf-16be">UTF-16 BE</option>
      </select>
    </div>
  );
  const rightExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setRight(SAMPLE_B)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setRight("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={rightInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleRightUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => rightInputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
      <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass} title="File encoding">
        <option value="utf-8">UTF-8</option>
        <option value="utf-16le">UTF-16 LE</option>
        <option value="utf-16be">UTF-16 BE</option>
      </select>
    </div>
  );

  const result = useMemo(() => {
    if (!left.trim() || !right.trim()) return null;
    try {
      return { diff: diffObjects(JSON.parse(left), JSON.parse(right)), error: null };
    } catch (e: unknown) {
      return { diff: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [left, right]);

  const diffText = result?.diff.map((d) =>
    `${d.type === "added" ? "+" : d.type === "removed" ? "-" : "~"} ${d.path}${d.type === "changed" ? ` (${d.oldValue} → ${d.newValue})` : d.type === "added" ? ` (${d.newValue})` : ` (${d.oldValue})`}`
  ).join("\n") ?? "";

  return (
    <ToolLayout title={tool?.label ?? "Schema Diff"} description={tool?.description ?? "Compare two JSON schemas side by side"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Schema A (JSON)" extra={leftExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={left} onChange={setLeft} language="json" placeholder='{"id": 1, "name": "test"}' fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Schema B (JSON)" extra={rightExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={right} onChange={setRight} language="json" placeholder='{"id": "1", "email": "x@y.z"}' fillHeight />
          </div>
        </div>
      </div>

      {result?.error && <div className="tool-card border-destructive/50 text-destructive text-sm mt-4">⚠ {result.error}</div>}

      {result && !result.error && (
        <div className="tool-card mt-4">
          {result.diff.length === 0 ? (
            <p className="text-sm text-muted-foreground">✓ Schemas are identical</p>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{result.diff.length} difference{result.diff.length !== 1 ? "s" : ""}</p>
                <CopyButton text={diffText} />
              </div>
              {result.diff.map((d, i) => (
                <div key={i} className={`text-xs font-mono ${d.type === "added" ? "text-primary" : d.type === "removed" ? "text-destructive" : "text-accent-foreground"}`}>
                  <span className="inline-block w-24">{d.type === "added" ? "+ Added" : d.type === "removed" ? "- Removed" : "~ Changed"}</span>
                  <span className="text-foreground">{d.path}</span>
                  {d.type === "changed" && <span className="text-muted-foreground ml-2">({d.oldValue} → {d.newValue})</span>}
                  {d.type === "added" && <span className="text-muted-foreground ml-2">({d.newValue})</span>}
                  {d.type === "removed" && <span className="text-muted-foreground ml-2">({d.oldValue})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default SchemaDiffPage;
