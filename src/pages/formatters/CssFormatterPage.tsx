import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { cssBeautify } from "@/core-utils/beautifier";
import { cssMinify } from "@/core-utils/minify";

const CssFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("body{margin:0;padding:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:20px}.header{background:#333;color:#fff;padding:10px 20px}");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleFormat = async () => {
    setLoading(true);
    setOutput("");
    try {
      setOutput(await cssBeautify(input, indent));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMinify = async () => {
    setLoading(true);
    setOutput("");
    try {
      setOutput(await cssMinify(input));
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "CSS Formatter"} description={tool?.description ?? "Format and beautify CSS code"}>
      <div className="tool-toolbar">
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="tool-select">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={8}>8 spaces</option>
        </select>
        <Button size="sm" onClick={handleFormat} disabled={loading}>Format</Button>
        <Button size="sm" variant="outline" onClick={handleMinify} disabled={loading}>Minify</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input CSS" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="css" placeholder="body { margin: 0; }" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="css" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default CssFormatterPage;
