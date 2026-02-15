import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";

const JsonTablePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

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
        {/* JSON Input: 50% height, max 50% */}
        <div className="tool-panel flex-1 min-h-0 max-h-[50%]">
          <PanelHeader label="JSON Input" text={input} onClear={() => { setInput(""); setError(""); }} />
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
