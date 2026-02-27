import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import ToolAlert from "@/components/common/ToolAlert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import IndentSelect, { type IndentOption } from "@/components/common/IndentSelect";

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

const EXAMPLES = [
  "$.store.name",
  "$.store.books[0]",
  "$.store.books[*].title",
  "$.store.books[*].price",
  "$..title",
  "$..price",
];

const JsonPathPage = () => {
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [pathInput, setPathInput] = useState("$.store.books[*].title");
  const [indent, setIndent] = useState<IndentOption>(2);

  const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
  const { result, error } = useMemo(() => {
    try {
      const obj = JSON.parse(jsonInput);
      const res = evaluateJsonPath(obj, pathInput);
      return { result: JSON.stringify(res.length === 1 ? res[0] : res, null, space), error: null };
    } catch (e) {
      return { result: "", error: (e as Error).message };
    }
  }, [jsonInput, pathInput, space]);

  return (
    <TwoPanelToolLayout
      topSection={
        <div className="tool-top-form">
          <div className="tool-top-form-row">
            <div className="tool-top-form-field flex-1 min-w-0">
              <Label htmlFor="jsonpath-input" className="tool-field-label shrink-0">
                JSONPath
              </Label>
              <Input
                id="jsonpath-input"
                className="h-7 font-mono flex-1 min-w-[16rem] max-w-2xl"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                placeholder="$..."
                aria-label="JSONPath expression"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="tool-caption shrink-0">Examples:</span>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setPathInput(ex)}
                className="text-xs px-2 py-1 rounded border border-border bg-muted/50 text-muted-foreground hover:text-foreground hover:border-border transition-colors font-mono shrink-0"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      }
      inputPane={{
        inputToolbar: {
          onSample: () => setJsonInput(SAMPLE_JSON),
          setInput: setJsonInput,
          fileAccept: ".json,application/json",
          onFileText: setJsonInput,
        },
        inputEditor: {
          value: jsonInput,
          onChange: setJsonInput,
          language: "json",
          placeholder: "{}",
        },
      }}
      outputPane={{
        title: "Result",
        copyText: result || undefined,
        toolbar: <IndentSelect value={indent} onChange={setIndent} />,
        children: error ? (
          <ToolAlert variant="error" message={error} className="flex-1 min-h-0 overflow-auto" />
        ) : (
          undefined
        ),
        outputEditor: !error
          ? {
              value: result,
              language: "json",
              placeholder: "Result will appear here...",
              outputKey: indent,
            }
          : undefined,
      }}
    />
  );
};

export default JsonPathPage;
