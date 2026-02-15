import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import PanelHeader from "@/components/PanelHeader";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";

type ViewMode = "input" | "table";
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

const CsvViewerPage = () => {
  const tool = useCurrentTool();
  const fileRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [csv, setCsv] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(-1);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCsv(await readFileAsText(file, fileEncoding));
    } catch {
      setCsv("");
    }
    e.target.value = "";
  };

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
    <ToolLayout title={tool?.label ?? "CSV Viewer"} description={tool?.description ?? "View and search CSV files in a table"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFile} />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload your CSV file">
              <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1.5" />
                Upload file
              </Button>
            </OptionField>
            <OptionField label="File encoding">
              <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass}>
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
              </select>
            </OptionField>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Delimiter">
              <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className={selectClass}>
                <option value=",">Comma (,)</option>
                <option value="	">Tab</option>
                <option value=";">Semicolon (;)</option>
                <option value="|">Pipe (|)</option>
              </select>
            </OptionField>
          </div>
        </div>
      </ToolOptions>
      <div className="flex flex-col flex-1 min-h-0 gap-3">
        <div className="tool-toolbar flex flex-wrap items-center gap-2 text-left">
          {parsed && (
            <>
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("input")}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "input" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  Input
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                >
                  Table
                </button>
              </div>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="input-compact flex-1 min-w-[160px] max-w-xs" />
              <span className="text-xs text-muted-foreground">{filtered?.rows.length}/{parsed.rows.length} rows</span>
            </>
          )}
        </div>

        {(!parsed || viewMode === "input") && (
          <div className="tool-panel flex-1 min-h-0">
            <PanelHeader label={parsed ? "CSV Input" : "Or paste CSV"} text={csv} onClear={() => setCsv("")} />
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <CodeEditor value={csv} onChange={setCsv} language="text" placeholder="name,age,city&#10;Alice,30,NYC&#10;Bob,25,LA" fillHeight />
            </div>
          </div>
        )}

        {parsed && viewMode === "table" && filtered && filtered.headers.length > 0 && (
          <div className="flex-1 min-h-0 overflow-auto rounded-md border border-border bg-card">
            <table className="w-full text-xs">
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
            {filtered.rows.length > 500 && <div className="text-xs text-muted-foreground text-center py-2">Showing first 500 of {filtered.rows.length} rows</div>}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default CsvViewerPage;
