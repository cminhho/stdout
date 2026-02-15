import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { htmlBeautify } from "@/core-utils/beautifier";

const minifyHtml = (html: string): string =>
  html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const HtmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState('<div class="container"><h1>Hello</h1><p>World</p><ul><li>Item 1</li><li>Item 2</li></ul></div>');
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleFormat = async () => {
    setLoading(true);
    setOutput("");
    try {
      setOutput(await htmlBeautify(input, indent));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "HTML Formatter"} description={tool?.description ?? "Format and beautify HTML code"}>
      <div className="tool-toolbar">
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="tool-select">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={8}>8 spaces</option>
        </select>
        <Button size="sm" onClick={handleFormat} disabled={loading}>
          {loading ? "Formatting…" : "Format"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOutput(minifyHtml(input))}>
          Minify
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input HTML" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="html" placeholder="<div>...</div>" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="html" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default HtmlFormatterPage;
