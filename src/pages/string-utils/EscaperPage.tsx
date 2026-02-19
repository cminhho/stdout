import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { FileCode, Eraser, Upload } from "lucide-react";
import { escapeText, unescapeText, type EscaperType } from "@/utils/escaper";

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

const SAMPLE_INPUT = 'Say "Hello" & <world>\nLine 2';

interface EscaperPageProps {
  type: EscaperType;
  title: string;
  description: string;
  /** Optional selector (e.g. dropdown) for format/type when used in unified tool */
  formatSelector?: React.ReactNode;
}

const EscaperPage = ({ type, title, description, formatSelector }: EscaperPageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (dir: "encode" | "decode") => {
    setOutput(dir === "encode" ? escapeText(type, input) : unescapeText(type, input));
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

  const accept = formatSelector
    ? ".json,.csv,.xml,.sql,.js,text/plain,application/json,text/csv,text/xml,application/javascript"
    : type === "json"
      ? ".json,application/json,text/plain"
      : ".csv,text/csv,text/plain";

  return (
    <ToolLayout title={title} description={description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <input ref={fileInputRef} type="file" accept={accept} className="hidden" onChange={handleFileUpload} />
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Input"
            extra={
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(SAMPLE_INPUT); setOutput(""); }}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(""); setOutput(""); }}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Output"
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                {formatSelector}
                <Button size="sm" className="h-7 text-xs" onClick={() => run("encode")}>Escape</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => run("decode")}>Unescape</Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="text" placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default EscaperPage;
