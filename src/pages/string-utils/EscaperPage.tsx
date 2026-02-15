import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";
import { escapeText, unescapeText, type EscaperType } from "@/utils/escaper";

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

interface EscaperPageProps {
  type: EscaperType;
  title: string;
  description: string;
}

const EscaperPage = ({ type, title, description }: EscaperPageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (dir: "encode" | "decode") => {
    setOutput(dir === "encode" ? escapeText(type, input) : unescapeText(type, input));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file, fileEncoding));
      setOutput("");
    } catch {
      setInput("");
      setOutput("");
    }
    e.target.value = "";
  };

  const accept = type === "json" ? ".json,application/json,text/plain" : ".csv,text/csv,text/plain";

  return (
    <ToolLayout title={title} description={description}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept={accept} className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload file">
              <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileInputRef.current?.click()}>
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
            <Button size="sm" onClick={() => run("encode")}>Escape</Button>
            <Button size="sm" variant="outline" onClick={() => run("decode")}>Unescape</Button>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="text" placeholder="Result..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default EscaperPage;
