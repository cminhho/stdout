import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function csvToRows(csv: string, delimiter: string): string[][] {
  const lines = csv.trim().split("\n");
  if (lines.length === 0) return [];
  return lines.map((line) => {
    const row: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else current += c;
      } else if (c === delimiter) {
        row.push(current.trim());
        current = "";
      } else {
        current += c;
      }
    }
    row.push(current.trim());
    return row;
  });
}

function csvToXml(csv: string, rootTag: string, rowTag: string, delimiter: string): string {
  const rows = csvToRows(csv, delimiter);
  if (rows.length < 2) return '<?xml version="1.0"?>\n<' + rootTag + "/>";
  const headers = rows[0];
  let out = '<?xml version="1.0"?>\n<' + rootTag + ">\n";
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    out += "  <" + rowTag + ">\n";
    for (let c = 0; c < headers.length; c++) {
      const tag = headers[c].replace(/[^a-zA-Z0-9_-]/g, "_") || "col" + c;
      const val = (row[c] ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      out += "    <" + tag + ">" + val + "</" + tag + ">\n";
    }
    out += "  </" + rowTag + ">\n";
  }
  out += "</" + rootTag + ">";
  return out;
}

const defaultCsv = "name,age,city\nAlice,30,NYC\nBob,25,LA";

const CsvXmlPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(defaultCsv);
  const [rootTag, setRootTag] = useState("root");
  const [rowTag, setRowTag] = useState("row");
  const [delimiter, setDelimiter] = useState(",");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: csvToXml(input, rootTag, rowTag, delimiter), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, rootTag, rowTag, delimiter]);

  return (
    <ToolLayout title={tool?.label ?? "CSV → XML"} description={tool?.description ?? "Convert CSV to XML (first row as element names)"}>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Root tag</Label>
          <Input value={rootTag} onChange={(e) => setRootTag(e.target.value)} className="w-24 h-8 font-mono" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Row tag</Label>
          <Input value={rowTag} onChange={(e) => setRowTag(e.target.value)} className="w-24 h-8 font-mono" />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Delimiter</Label>
          <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="w-12 h-8 font-mono" maxLength={1} />
        </div>
      </div>
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="CSV" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="text" placeholder="name,age,city\nAlice,30,NYC" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="XML" text={output} />
          <CodeEditor value={output} readOnly language="xml" placeholder="Result..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default CsvXmlPage;
