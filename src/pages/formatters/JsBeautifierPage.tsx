import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { jsBeautify } from "@/utils/beautifier";

const JsBeautifierPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("function foo(){const a=1;return a+1;}");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleBeautify = async () => {
    setLoading(true);
    setOutput("");
    try {
      const result = await jsBeautify(input, indent);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "JS Beautifier"} description={tool?.description ?? "Format and indent JavaScript code"}>
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
          <CodeEditor value={input} onChange={setInput} language="javascript" placeholder="Paste minified JS..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="javascript" placeholder="Formatted code..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsBeautifierPage;
