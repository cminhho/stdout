import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileCode, Eraser } from "lucide-react";

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

const SAMPLE_JSON = `{
  "store": {
    "books": [
      { "category": "fiction", "title": "The Great Gatsby", "price": 10.99 },
      { "category": "fiction", "title": "1984", "price": 8.99 },
      { "category": "science", "title": "Cosmos", "price": 15.99 },
      { "category": "science", "title": "A Brief History of Time", "price": 12.99 }
    ],
    "name": "My Bookstore",
    "open": true
  }
}`;

/**
 * Simple JSONPath evaluator supporting:
 * $.key, $.key.nested, $.arr[0], $.arr[*], $.arr[*].field
 * $..key (recursive descent)
 */
const evaluateJsonPath = (obj: unknown, path: string): unknown[] => {
  if (!path.startsWith("$")) return [];

  const results: unknown[] = [];
  const segments = tokenizePath(path.slice(1));

  const walk = (current: unknown, segs: string[]) => {
    if (segs.length === 0) {
      results.push(current);
      return;
    }

    const [seg, ...rest] = segs;

    if (seg === "") {
      walk(current, rest);
      return;
    }

    // Recursive descent
    if (seg === "..") {
      const nextKey = rest[0];
      const deepRest = rest.slice(1);
      const recurse = (node: unknown) => {
        if (node && typeof node === "object") {
          const entries = Array.isArray(node) ? node.map((v, i) => [String(i), v]) : Object.entries(node as Record<string, unknown>);
          for (const [k, v] of entries) {
            if (k === nextKey) walk(v, deepRest);
            recurse(v);
          }
        }
      };
      recurse(current);
      return;
    }

    // Array wildcard
    if (seg === "[*]") {
      if (Array.isArray(current)) {
        current.forEach((item) => walk(item, rest));
      }
      return;
    }

    // Array index
    const indexMatch = seg.match(/^\[(\d+)]$/);
    if (indexMatch && Array.isArray(current)) {
      const idx = Number(indexMatch[1]);
      if (idx < current.length) walk(current[idx], rest);
      return;
    }

    // Key access
    const key = seg.replace(/^\./, "");
    if (current && typeof current === "object" && !Array.isArray(current)) {
      const record = current as Record<string, unknown>;
      if (key in record) walk(record[key], rest);
    }
  };

  walk(obj, segments);
  return results;
};

const tokenizePath = (path: string): string[] => {
  const tokens: string[] = [];
  let i = 0;
  while (i < path.length) {
    if (path[i] === ".") {
      if (path[i + 1] === ".") {
        tokens.push("..");
        i += 2;
      } else {
        i++;
      }
    } else if (path[i] === "[") {
      const end = path.indexOf("]", i);
      tokens.push(path.slice(i, end + 1));
      i = end + 1;
    } else {
      let end = i;
      while (end < path.length && path[end] !== "." && path[end] !== "[") end++;
      tokens.push(path.slice(i, end));
      i = end;
    }
  }
  return tokens;
};

const JsonPathPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [pathInput, setPathInput] = useState("$.store.books[*].title");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setJsonInput(await readFileAsText(file));
    } catch {
      setJsonInput("");
    }
    e.target.value = "";
  };

  const { result, error } = useMemo(() => {
    try {
      const obj = JSON.parse(jsonInput);
      const res = evaluateJsonPath(obj, pathInput);
      return { result: JSON.stringify(res.length === 1 ? res[0] : res, null, 2), error: null };
    } catch (e) {
      return { result: "", error: (e as Error).message };
    }
  }, [jsonInput, pathInput]);

  const examples = [
    "$.store.name",
    "$.store.books[0]",
    "$.store.books[*].title",
    "$.store.books[*].price",
    "$..title",
    "$..price",
  ];

  const jsonInputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setJsonInput(SAMPLE_JSON)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setJsonInput("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "JSONPath Tester"} description={tool?.description ?? "Test JSONPath expressions against JSON data"}>
      <div className="tool-toolbar flex flex-col gap-2 items-start text-left">
        <div className="flex gap-3 items-end w-full">
          <div className="flex-1 min-w-0 max-w-full">
            <Label className="text-xs text-muted-foreground mb-1 block">JSONPath Expression</Label>
            <Input className="input-compact font-mono w-full" value={pathInput} onChange={(e) => setPathInput(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-start">
          <span className="text-xs text-muted-foreground">Examples:</span>
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPathInput(ex)}
              className="text-xs px-2 py-0.5 rounded bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors font-mono"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="JSON Input" extra={jsonInputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={jsonInput} onChange={setJsonInput} language="json" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Result" text={result} />
          {error ? (
            <div className="flex-1 min-h-0 overflow-auto rounded border border-border bg-muted/30 p-3 text-destructive text-sm font-mono">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={result} readOnly language="json" placeholder="Result will appear here..." fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonPathPage;
