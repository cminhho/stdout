import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const SAMPLE_CSV = "name,age,city\nAlice,30,NYC\nBob,25,LA";

const CsvXmlPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState(SAMPLE_CSV);
  const [rootTag, setRootTag] = useState("root");
  const [rowTag, setRowTag] = useState("row");
  const [delimiter, setDelimiter] = useState(",");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file, fileEncoding));
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

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
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <span className="text-xs text-muted-foreground">Root</span>
        <Input value={rootTag} onChange={(e) => setRootTag(e.target.value)} className="h-7 w-24 font-mono rounded border border-input bg-background px-2 text-xs" />
        <span className="text-xs text-muted-foreground">Row</span>
        <Input value={rowTag} onChange={(e) => setRowTag(e.target.value)} className="h-7 w-24 font-mono rounded border border-input bg-background px-2 text-xs" />
        <span className="text-xs text-muted-foreground">Delimiter</span>
        <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="h-7 w-12 font-mono rounded border border-input bg-background px-2 text-xs text-center" maxLength={1} />
      </div>
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="CSV"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_CSV)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
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
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="name,age,city\nAlice,30,NYC" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="XML" text={output} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CsvXmlPage;
