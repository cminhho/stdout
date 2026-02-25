import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import ToolAlert from "@/components/ToolAlert";
import { parseJsonToTable, JSON_TABLE_FILE_ACCEPT, JSON_TABLE_SAMPLE, JSON_TABLE_PLACEHOLDER } from "@/utils/jsonTable";

const JsonTablePage = () => {
  const [input, setInput] = useState("");

  const { data: tableData, error } = useMemo(() => parseJsonToTable(input), [input]);

  const tableContent = tableData && tableData.headers.length > 0 ? (
    <div className="tool-reference-table-wrap">
    <table className="tool-reference-table">
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
    </div>
  ) : !error && input.trim() ? (
    <div className="flex items-center justify-center text-muted-foreground text-sm p-8">No valid table data</div>
  ) : null;

  return (
    <TwoPanelToolLayout
      inputPane={{
        title: "JSON Input",
        inputToolbar: {
          onSample: () => setInput(JSON_TABLE_SAMPLE),
          setInput,
          fileAccept: JSON_TABLE_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "json",
          placeholder: JSON_TABLE_PLACEHOLDER,
        },
      }}
      outputPane={{
        title: "JSON Table",
        children: (
          <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
            {error && <ToolAlert variant="error" message={error} prefix="✗ " />}
            <div className="flex-1 min-h-0 overflow-auto rounded-md border bg-card border-border">
              {tableContent}
            </div>
          </div>
        ),
      }}
    />
  );
};

export default JsonTablePage;
