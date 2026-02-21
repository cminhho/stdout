import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import { parseJsonToTable, JSON_TABLE_FILE_ACCEPT, JSON_TABLE_SAMPLE, JSON_TABLE_PLACEHOLDER } from "@/utils/jsonTable";

const JsonTablePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  const { data: tableData, error } = useMemo(() => parseJsonToTable(input), [input]);

  return (
    <ToolLayout title={tool?.label ?? "JSON → Table"} description={tool?.description ?? "Visualize JSON data as a table"}>
      <div className="flex flex-col flex-1 min-h-0 gap-4">
        <div className="tool-panel flex-1 min-h-0 max-h-[50%] flex flex-col min-h-0">
          <PanelHeader
            label="JSON Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(JSON_TABLE_SAMPLE)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={JSON_TABLE_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <CodeEditor value={input} onChange={setInput} language="json" placeholder={JSON_TABLE_PLACEHOLDER} fillHeight />
          </div>
        </div>

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
                      <th key={h} className="text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase sticky top-0 bg-card">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 font-mono text-xs text-foreground">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : !error && input.trim() ? (
              <div className="flex items-center justify-center text-muted-foreground text-sm p-8">No valid table data</div>
            ) : null}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonTablePage;
