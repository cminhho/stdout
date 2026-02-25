import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const DELIMITER_OPTIONS = [
  { value: ",", label: "Comma (,)" },
  { value: "\t", label: "Tab" },
  { value: ";", label: "Semicolon (;)" },
  { value: "|", label: "Pipe (|)" },
] as const;

const SAMPLE_CSV = "name,age,city\nAlice,30,NYC\nBob,25,LA\nCarol,28,Chicago";
const CSV_PLACEHOLDER = "name,age,city\nAlice,30,NYC\nBob,25,LA";

const CsvViewerPage = () => {
  const [csv, setCsv] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(-1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const parsed = useMemo(() => {
    if (!csv.trim()) return null;
    const lines = csv.trim().split("\n");
    const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) => line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, "")));
    return { headers, rows };
  }, [csv, delimiter]);

  const filtered = useMemo(() => {
    if (!parsed) return null;
    let rows = parsed.rows;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.some((c) => c.toLowerCase().includes(q)));
    }
    if (sortCol >= 0) {
      rows = [...rows].sort((a, b) => {
        const va = a[sortCol] || "";
        const vb = b[sortCol] || "";
        const na = parseFloat(va), nb = parseFloat(vb);
        if (!isNaN(na) && !isNaN(nb)) return sortDir === "asc" ? na - nb : nb - na;
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }
    return { ...parsed, rows };
  }, [parsed, search, sortCol, sortDir]);

  const toggleSort = (col: number) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setCsv(SAMPLE_CSV),
          setInput: setCsv,
          fileAccept: ".csv,.tsv,.txt",
          onFileText: setCsv,
        },
        inputToolbarExtra: (
          <SelectWithOptions
            size="xs"
            variant="secondary"
            value={delimiter}
            onValueChange={setDelimiter}
            options={DELIMITER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            title="Delimiter"
            aria-label="CSV delimiter"
          />
        ),
        inputEditor: {
          value: csv,
          onChange: setCsv,
          language: "text",
          placeholder: CSV_PLACEHOLDER,
        },
      }}
      outputPane={{
        title: "Table",
        toolbar: parsed ? (
          <>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input-compact flex-1 min-w-[160px] max-w-xs h-7"
            />
            <span className="tool-caption shrink-0">{filtered?.rows.length ?? 0}/{parsed.rows.length} rows</span>
          </>
        ) : undefined,
        children: parsed && filtered && filtered.headers.length > 0 ? (
          <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-card">
            <div className="tool-reference-table-wrap">
            <table className="tool-reference-table">
              <thead>
                <tr className="bg-muted/50 sticky top-0 z-10">
                  <th className="px-3 py-2 text-left text-muted-foreground font-medium w-10 bg-muted/50">#</th>
                  {filtered.headers.map((h, i) => (
                    <th key={i} onClick={() => toggleSort(i)} className="px-3 py-2 text-left text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors bg-muted/50">
                      {h} {sortCol === i ? (sortDir === "asc" ? "↑" : "↓") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.rows.slice(0, 500).map((row, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-1.5 text-muted-foreground font-mono">{i + 1}</td>
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-1.5 font-mono text-foreground">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {filtered.rows.length > 500 && (
              <div className="tool-caption text-center py-2">
                Showing first 500 of {filtered.rows.length} rows
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center rounded-md border border-border bg-muted/20 text-sm text-muted-foreground">
            Paste CSV or upload a file to see table
          </div>
        ),
      }}
    />
  );
};

export default CsvViewerPage;
