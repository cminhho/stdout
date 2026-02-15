import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

const csvToJson = (csv: string, delimiter = ","): unknown[] => {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
};

const jsonToCsv = (json: unknown[]): string => {
  if (!Array.isArray(json) || json.length === 0) return "";
  const headers = [...new Set(json.flatMap((item) => Object.keys(item as Record<string, unknown>)))];
  const rows = json.map((item) => {
    const obj = item as Record<string, unknown>;
    return headers.map((h) => {
      const v = String(obj[h] ?? "");
      return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
    }).join(",");
  });
  return [headers.join(","), ...rows].join("\n");
};

const CsvJsonPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"csv2json" | "json2csv">("csv2json");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "csv2json") {
        return { output: JSON.stringify(csvToJson(input), null, 2), error: "" };
      } else {
        const parsed = JSON.parse(input);
        if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array");
        return { output: jsonToCsv(parsed), error: "" };
      }
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  const inputLang = mode === "csv2json" ? "text" as const : "json" as const;
  const outputLang = mode === "csv2json" ? "json" as const : "text" as const;

  return (
    <ToolLayout title={tool?.label ?? "CSV ↔ JSON"} description={tool?.description ?? "Convert between CSV and JSON formats"}>
      <div className="tool-toolbar">
        <Button size="sm" variant={mode === "csv2json" ? "default" : "outline"} onClick={() => { setMode("csv2json"); }}>
          CSV → JSON
        </Button>
        <Button size="sm" variant={mode === "json2csv" ? "default" : "outline"} onClick={() => { setMode("json2csv"); }}>
          JSON → CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader
            label={mode === "csv2json" ? "CSV Input" : "JSON Input"}
            text={input}
            onClear={() => setInput("")}
          />
          <CodeEditor
            value={input}
            onChange={setInput}
            language={inputLang}
            placeholder={mode === "csv2json" ? "name,age,city\nAlice,30,NYC\nBob,25,LA" : '[{"name":"Alice","age":30}]'}
          />
        </div>
        <div className="tool-panel">
          <PanelHeader
            label={mode === "csv2json" ? "JSON Output" : "CSV Output"}
            text={output}
          />
          {error ? (
            <div className="code-block text-destructive flex-1">{error}</div>
          ) : (
            <CodeEditor value={output} readOnly language={outputLang} placeholder="Result will appear here..." />
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default CsvJsonPage;
