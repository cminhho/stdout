import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import { cssBeautify } from "@/utils/beautifier";
import { cssMinify } from "@/utils/minify";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";

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

const SAMPLE_CSS = `body { margin: 0; padding: 0; font-family: sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { background: #333; color: #fff; padding: 10px 20px; }
.main { display: flex; gap: 1rem; }
.footer { margin-top: 2rem; text-align: center; }`;

const CssFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("body{margin:0;padding:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:20px}.header{background:#333;color:#fff;padding:10px 20px}");
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<IndentOption>(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const run =
      indentOption === "minified"
        ? () => cssMinify(input)
        : () => cssBeautify(input, typeof indentOption === "number" ? indentOption : 2);
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
  }, [input, indentOption]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      setInput(text);
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const inputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_CSS)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".css,text/css"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
    </div>
  );

  const outputExtra = (
    <div className="flex items-center gap-2">
      <IndentSelect
        value={indentOption}
        onChange={setIndentOption}
        includeTab={false}
        className={selectClass}
      />
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "CSS Beautifier/Minifier"} description={tool?.description ?? "Beautify or minify CSS"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Input CSS" extra={inputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="css" placeholder="body { margin: 0; }" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} extra={outputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={output}
              readOnly
              language="css"
              placeholder={loading ? "Formatting…" : "Result will appear here..."}
              fillHeight
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CssFormatterPage;
