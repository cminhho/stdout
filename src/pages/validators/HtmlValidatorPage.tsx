import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";
import { validateHtml } from "@/utils/validators";

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

const HtmlValidatorPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState(`<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><p>Hello</p></body>
</html>`);

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

  const result = useMemo(() => validateHtml(input), [input]);

  return (
    <ToolLayout title={tool?.label ?? "HTML Validator"} description={tool?.description ?? "Validate HTML syntax (parser-based)"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <OptionField label="Upload your HTML file">
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
      </ToolOptions>
      {input.trim() && (
        <div className={`mb-3 rounded-md border px-3 py-2 text-sm ${result.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/50 bg-destructive/10"}`}>
          {result.valid ? "✓ Valid HTML" : `✗ ${result.error}`}
        </div>
      )}
      <div className="tool-panel">
        <PanelHeader label="HTML Input" text={input} onClear={() => setInput("")} />
        <CodeEditor value={input} onChange={setInput} language="html" placeholder="Paste HTML here..." />
      </div>
    </ToolLayout>
  );
};

export default HtmlValidatorPage;
