import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { cssBeautify } from "@/utils/beautifier";

const CssBeautifierPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("body{margin:0;padding:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto}");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleBeautify = async () => {
    setLoading(true);
    setOutput("");
    try {
      const result = await cssBeautify(input, indent);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "CSS Beautifier"} description={tool?.description ?? "Format and indent CSS code"}>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select
          value={indent}
          onChange={(e) => setIndent(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
        </select>
        <Button size="sm" onClick={handleBeautify} disabled={loading}>
          {loading ? "Formatting…" : "Beautify"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="css" placeholder="Paste minified CSS..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="css" placeholder="Formatted CSS..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default CssBeautifierPage;
