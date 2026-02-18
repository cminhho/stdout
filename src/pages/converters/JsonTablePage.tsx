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

const SAMPLE_JSON = '[{"name": "Alice", "age": 30, "city": "NYC"}, {"name": "Bob", "age": 25, "city": "LA"}]';

const JsonTablePage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file, fileEncoding));
      setError("");
    } catch {
      setInput("");
      setError("");
    }
    e.target.value = "";
  };

  const tableData = useMemo(() => {
    if (!input.trim()) { setError(""); return null; }
    try {
      const parsed = JSON.parse(input);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      if (arr.length === 0) return { headers: [], rows: [] };
      const headers = [...new Set(arr.flatMap((item) => Object.keys(item)))];
      const rows = arr.map((item) => headers.map((h) => {
        const v = item[h];
        return v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
      }));
      setError("");
      return { headers, rows };
    } catch (e) {
      setError((e as Error).message);
      return null;
    }
  }, [input]);

  return (
    <ToolLayout title={tool?.label ?? "JSON → Table"} description={tool?.description ?? "Visualize JSON data as a table"}>
      <div className="flex flex-col flex-1 min-h-0 gap-4">
        <div className="tool-panel flex-1 min-h-0 max-h-[50%] flex flex-col min-h-0">
          <PanelHeader
            label="JSON Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(SAMPLE_JSON); setError(""); }}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(""); setError(""); }}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
                <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass}>
                  <option value="utf-8">UTF-8</option>
                  <option value="utf-16le">UTF-16 LE</option>
                  <option value="utf-16be">UTF-16 BE</option>
                </select>
              </div>
            }
          />
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder='[{"name": "Alice", "age": 30}]'
              fillHeight
            />
          </div>
        </div>

        {/* JSON Table section: 50% height, title + table, max 50% */}
        <div className="flex flex-col flex-1 min-h-0 max-h-[50%]">
          <div className="flex-shrink-0 mb-2 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">JSON Table</h2>
            {error && <span className="text-xs text-destructive">{error}</span>}
          </div>
          <div className="flex-1 min-h-0 overflow-auto rounded-md border bg-card border-border">
            {tableData && tableData.headers.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {tableData.headers.map((h) => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase sticky top-0 bg-card">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 font-mono text-xs text-foreground">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : !error && input.trim() ? (
              <div className="flex items-center justify-center text-muted-foreground text-sm p-8">
                No valid table data
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonTablePage;
