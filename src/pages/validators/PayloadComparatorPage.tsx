import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
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
const SAMPLE_A = '{"status": "ok", "data": [1, 2, 3], "count": 3}';
const SAMPLE_B = '{"status": "error", "data": [1, 2], "count": 2}';

interface Diff {
  path: string;
  type: "added" | "removed" | "changed";
  oldVal?: unknown;
  newVal?: unknown;
}

function deepDiff(a: unknown, b: unknown, path = ""): Diff[] {
  const diffs: Diff[] = [];
  if (a === b) return diffs;
  if (typeof a !== typeof b || a === null || b === null) {
    diffs.push({ path: path || "(root)", type: "changed", oldVal: a, newVal: b });
    return diffs;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const max = Math.max(a.length, b.length);
    for (let i = 0; i < max; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length) diffs.push({ path: p, type: "added", newVal: b[i] });
      else if (i >= b.length) diffs.push({ path: p, type: "removed", oldVal: a[i] });
      else diffs.push(...deepDiff(a[i], b[i], p));
    }
  } else if (typeof a === "object") {
    const oa = a as Record<string, unknown>, ob = b as Record<string, unknown>;
    const keysA = Object.keys(oa);
    const keysB = Object.keys(ob);
    const allKeys = new Set([...keysA, ...keysB]);
    for (const key of allKeys) {
      const p = path ? `${path}.${key}` : key;
      if (!(key in oa)) diffs.push({ path: p, type: "added", newVal: ob[key] });
      else if (!(key in ob)) diffs.push({ path: p, type: "removed", oldVal: oa[key] });
      else diffs.push(...deepDiff(oa[key], ob[key], p));
    }
  } else {
    diffs.push({ path: path || "(root)", type: "changed", oldVal: a, newVal: b });
  }
  return diffs;
}

const PayloadComparatorPage = () => {
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
      return { diffs: deepDiff(JSON.parse(left), JSON.parse(right)), error: null };
    } catch (e: unknown) {
      return { diffs: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [left, right]);

  const diffText = result?.diffs.map(d => `${d.type} ${d.path}: ${d.type === "changed" ? `${JSON.stringify(d.oldVal)} → ${JSON.stringify(d.newVal)}` : JSON.stringify(d.newVal ?? d.oldVal)}`).join("\n") ?? "";

  return (
    <ToolLayout title={tool?.label ?? "Payload Comparator"} description={tool?.description ?? "Compare two JSON payloads and highlight differences"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Payload A" extra={leftExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={left} onChange={setLeft} language="json" placeholder='{"status": "ok", "data": [1,2,3]}' fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Payload B" extra={rightExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={right} onChange={setRight} language="json" placeholder='{"status": "error", "data": [1,2]}' fillHeight />
          </div>
        </div>
      </div>

      {result?.error && <div className="tool-card border-destructive/50 text-destructive text-sm mt-4">⚠ {result.error}</div>}

      {result && !result.error && (
        <div className="tool-panel flex flex-col min-h-0 mt-4">
          {result.diffs.length === 0 ? (
            <p className="text-sm text-muted-foreground">✓ Payloads are identical</p>
          ) : (
            <>
              <PanelHeader label={`${result.diffs.length} difference${result.diffs.length !== 1 ? "s" : ""}`} text={diffText} />
              <div className="flex-1 min-h-0 max-h-[50vh] flex flex-col">
                <CodeEditor value={diffText} readOnly language="text" fillHeight />
              </div>
            </>
          )}
        </div>
      )}
    </ToolLayout>
  );
};

export default PayloadComparatorPage;
