import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const SAMPLE_HTML = "<div>Hello &amp; World</div>";

const htmlEncode = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const htmlDecode = (s: string) => {
  const doc = new DOMParser().parseFromString(s, "text/html");
  return doc.documentElement.textContent ?? "";
};

const HtmlEntityPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (dir: "encode" | "decode") => {
    setOutput(dir === "encode" ? htmlEncode(input) : htmlDecode(input));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file));
      setOutput("");
    } catch {
      setInput("");
      setOutput("");
    }
    e.target.value = "";
  };

  return (
    <ToolLayout title={tool?.label ?? "HTML Entity"} description={tool?.description ?? "Encode and decode HTML entities"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <Button size="sm" onClick={() => run("encode")} className="h-7 text-xs">Encode</Button>
        <Button size="sm" variant="outline" onClick={() => run("decode")} className="h-7 text-xs">Decode</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(SAMPLE_HTML); setOutput(""); }}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(""); setOutput(""); }}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".html,.htm,text/html,text/plain" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="html" placeholder="<div>Hello</div>" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="html" placeholder="Result will appear here..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default HtmlEntityPage;
