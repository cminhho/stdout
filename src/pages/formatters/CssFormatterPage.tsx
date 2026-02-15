import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";
import { cssBeautify } from "@/utils/beautifier";
import { cssMinify } from "@/utils/minify";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";
type TextMode = "formatted" | "minified";

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

const CssFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [input, setInput] = useState("body{margin:0;padding:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:20px}.header{background:#333;color:#fff;padding:10px 20px}");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [textMode, setTextMode] = useState<TextMode>("formatted");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const run = textMode === "formatted" ? () => cssBeautify(input, indent) : () => cssMinify(input);
    run()
      .then((result) => {
        if (!cancelled) setOutput(result);
      })
      .catch((err) => {
        if (!cancelled) setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [input, indent, textMode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file, fileEncoding);
      setInput(text);
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  return (
    <ToolLayout title={tool?.label ?? "CSS Formatter"} description={tool?.description ?? "Format and beautify CSS code"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".css,text/css"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload your CSS file">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 mr-1.5" />
                Upload file
              </Button>
            </OptionField>
            <OptionField label="File encoding">
              <select
                value={fileEncoding}
                onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
                className={selectClass}
              >
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
              </select>
            </OptionField>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Text mode">
              <select value={textMode} onChange={(e) => setTextMode(e.target.value as TextMode)} className={selectClass}>
                <option value="formatted">Formatted</option>
                <option value="minified">Minified</option>
              </select>
            </OptionField>
            <OptionField label="Indentation level">
              <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className={selectClass}>
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
              </select>
            </OptionField>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input CSS" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="css" placeholder="body { margin: 0; }" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="css" placeholder={loading ? "Formatting…" : "Result will appear here..."} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default CssFormatterPage;
