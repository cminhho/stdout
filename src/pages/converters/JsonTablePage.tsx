import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import ToolAlert from "@/components/common/ToolAlert";
import { parseJsonToTable, JSON_TABLE_FILE_ACCEPT, JSON_TABLE_SAMPLE, JSON_TABLE_PLACEHOLDER } from "@/utils/jsonTable";

const JsonTablePage = () => {
  const [input, setInput] = useState("");

  const { data: tableData, error } = useMemo(() => parseJsonToTable(input), [input]);

  const tableContent =
    tableData && tableData.headers.length > 0 ? (
      <div className="tool-reference-table-wrap">
        <table className="tool-reference-table border-collapse" aria-label="JSON as table">
          <thead className="sticky top-0 z-10 border-b border-border bg-muted/60 backdrop-blur-[var(--glass-blur-subtle)]">
            <tr>
              {tableData.headers.map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 font-medium text-muted-foreground text-[length:var(--text-ui)] uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-border/50 last:border-0 min-h-touch transition-colors duration-150 hover:bg-muted/30"
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 font-mono text-[length:var(--text-ui)] text-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : !error && input.trim() ? (
      <div
        className="flex items-center justify-center text-muted-foreground text-[length:var(--text-ui)] p-8"
        role="status"
      >
        No valid table data
      </div>
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
          <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-hidden">
            {error && <ToolAlert variant="error" message={error} prefix="✗ " className="shrink-0" />}
            <section
              className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden"
              aria-label="Table"
            >
              <div className="shrink-0 px-[var(--spacing-panel-inner-x)] pt-[var(--spacing-panel-inner-y)] pb-2">
                <h2 className="home-section-label mb-0">Table</h2>
              </div>
              <div className="flex-1 min-h-0 overflow-auto border-t border-border">{tableContent}</div>
            </section>
          </div>
        ),
      }}
    />
  );
};

export default JsonTablePage;
