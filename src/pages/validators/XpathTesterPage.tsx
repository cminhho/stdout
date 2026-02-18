import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileCode, Eraser } from "lucide-react";
import { evaluateXPath } from "@/utils/validators";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const SAMPLE_XML = `<?xml version="1.0"?>
<books>
  <book id="1"><title>Alpha</title><year>2020</year></book>
  <book id="2"><title>Beta</title><year>2021</year></book>
</books>`;

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

const XpathTesterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xml, setXml] = useState(SAMPLE_XML);
  const [xpath, setXpath] = useState("//book/title");
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");

  const result = useMemo(() => evaluateXPath(xml, xpath), [xml, xpath]);

  const resultText = result.items.map((i) => `[${i.type}] ${i.value}`).join("\n\n") || "";

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setXml(await readFileAsText(file, fileEncoding));
    } catch {
      setXml("");
    }
    e.target.value = "";
  };

  const xmlExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setXml(SAMPLE_XML)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setXml("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={fileInputRef} type="file" accept=".xml,application/xml,text/xml" className="hidden" onChange={handleFileUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
      <select
        value={fileEncoding}
        onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
        className={selectClass}
        title="File encoding"
      >
        <option value="utf-8">UTF-8</option>
        <option value="utf-16le">UTF-16 LE</option>
        <option value="utf-16be">UTF-16 BE</option>
      </select>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "XPath Tester"} description={tool?.description ?? "Run XPath expressions against XML"}>
      <div className="space-y-3 flex flex-col min-h-0">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">XPath expression</label>
          <Input
            value={xpath}
            onChange={(e) => setXpath(e.target.value)}
            placeholder="e.g. //book/title or //item[@id='1']"
            className="font-mono"
          />
        </div>
        {result.error && (
          <div className="text-sm text-destructive">✗ {result.error}</div>
        )}
        {result.items.length > 0 && (
          <div className="rounded-md border border-border overflow-hidden">
            <div className="px-2 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground">
              {result.items.length} result(s)
            </div>
            <ul className="divide-y divide-border max-h-48 overflow-y-auto">
              {result.items.map((item, i) => (
                <li key={i} className="p-2 text-xs">
                  <span className="text-muted-foreground mr-2">[{item.type}]</span>
                  <pre className="inline whitespace-pre-wrap break-all font-mono">{item.value}</pre>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="tool-panel flex flex-col min-h-0">
            <PanelHeader label="XML" extra={xmlExtra} />
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={xml} onChange={setXml} language="xml" placeholder="Paste XML..." fillHeight />
            </div>
          </div>
          <div className="tool-panel flex flex-col min-h-0">
            <PanelHeader label="Results" text={resultText || undefined} />
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor
                value={resultText || "Run XPath to see results"}
                readOnly
                language="text"
                fillHeight
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XpathTesterPage;
