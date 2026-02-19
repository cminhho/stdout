import { useState, useRef, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import { htmlBeautify } from "@/utils/beautifier";
import { validateHtml } from "@/utils/validators";

type IndentOption = "2" | "4" | "tab" | "minified";

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sample</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <header><h1>Hello</h1></header>
    <main>
      <p>Edit this HTML and use Beautify or Minify.</p>
      <ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>
    </main>
    <footer><p>&copy; Example</p></footer>
  </div>
</body>
</html>`;

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

const minifyHtml = (html: string): string =>
  html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const HtmlFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('<div class="container"><h1>Hello</h1><p>World</p><ul><li>Item 1</li><li>Item 2</li></ul></div>');
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<IndentOption>("2");
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => validateHtml(input), [input]);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (indentOption === "minified") {
      setOutput(minifyHtml(input));
      return;
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const indentNum = indentOption === "tab" ? 2 : Number(indentOption);
    const useTabs = indentOption === "tab";
    htmlBeautify(input, indentNum, useTabs)
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
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_HTML)}>
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
        accept=".html,.htm,text/html"
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
      <select
        value={indentOption}
        onChange={(e) => setIndentOption(e.target.value as IndentOption)}
        className={selectClass}
        title="Indentation"
      >
        <option value="2">2 spaces</option>
        <option value="4">4 spaces</option>
        <option value="tab">1 tab</option>
        <option value="minified">Minified</option>
      </select>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "HTML Beautify/Minify/Validate"} description={tool?.description ?? "Beautify, minify & validate HTML"}>
      {input.trim() && (
        <div
          className={`mb-3 rounded-md border px-3 py-2 text-sm ${validation.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/50 bg-destructive/10"}`}
        >
          {validation.valid ? "✓ Valid HTML" : `✗ ${validation.error}`}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Input HTML" extra={inputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="html" placeholder="<div>...</div>" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} extra={outputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={output}
              readOnly
              language="html"
              placeholder={loading ? "Formatting…" : "Result will appear here..."}
              fillHeight
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default HtmlFormatterPage;
