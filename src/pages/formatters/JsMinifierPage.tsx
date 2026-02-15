import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { jsMinify } from "@/core-utils/minify";

const JsMinifierPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(`function add(a, b) {
  return a + b;
}`);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMinify = async () => {
    setLoading(true);
    setOutput("");
    try {
      const result = await jsMinify(input);
      setOutput(result);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "JS Minifier"} description={tool?.description ?? "Remove comments and collapse whitespace in JavaScript"}>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={handleMinify} disabled={loading}>
          {loading ? "Minifying…" : "Minify"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="javascript" placeholder="Paste JavaScript..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="javascript" placeholder="Minified code..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsMinifierPage;
