import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";
import { htmlBeautify } from "@/utils/beautifier";

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

const minifyHtml = (html: string): string =>
  html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const HtmlFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('<div class="container"><h1>Hello</h1><p>World</p><ul><li>Item 1</li><li>Item 2</li></ul></div>');
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [textMode, setTextMode] = useState<TextMode>("formatted");
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (textMode === "minified") {
      setOutput(minifyHtml(input));
      return;
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    htmlBeautify(input, indent)
      .then((formatted) => {
        if (!cancelled) setOutput(formatted);
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
    <ToolLayout title={tool?.label ?? "HTML Formatter"} description={tool?.description ?? "Format and beautify HTML code"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,text/html"
          className="hidden"
          onChange={handleFileUpload}
        />
        <OptionField label="Upload your HTML file">
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
        <OptionField label="Text mode">
          <select
            value={textMode}
            onChange={(e) => setTextMode(e.target.value as TextMode)}
            className={selectClass}
          >
            <option value="formatted">Formatted</option>
            <option value="minified">Minified</option>
          </select>
        </OptionField>
        <OptionField label="Indentation level">
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className={selectClass}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </OptionField>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input HTML" text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language="html" placeholder="<div>...</div>" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="html" placeholder={loading ? "Formatting…" : "Result will appear here..."} />
        </div>
      </div>
    </ToolLayout>
  );
};

export default HtmlFormatterPage;
