import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { base64Encode, base64Decode } from "@/utils/encode";

const Base64Page = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const run = (dir: "encode" | "decode") => {
    try {
      setError("");
      setOutput(dir === "encode" ? base64Encode(input) : base64Decode(input));
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "Base64"} description={tool?.description ?? "Encode and decode Base64 strings"}>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={() => run("encode")}>Encode</Button>
        <Button size="sm" variant="outline" onClick={() => run("decode")}>Decode</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Input" text={input} onClear={() => { setInput(""); setOutput(""); setError(""); }} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} />
          {error && <div className="code-block text-destructive text-xs shrink-0">⚠ {error}</div>}
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output || ""} readOnly language="text" placeholder="Result will appear here..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default Base64Page;
