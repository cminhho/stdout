import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

const htmlEncode = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

const htmlDecode = (s: string) => {
  const doc = new DOMParser().parseFromString(s, "text/html");
  return doc.documentElement.textContent ?? "";
};

const HtmlEntityPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (dir: "encode" | "decode") => {
    setOutput(dir === "encode" ? htmlEncode(input) : htmlDecode(input));
  };

  return (
    <ToolLayout title={tool?.label ?? "HTML Entity"} description={tool?.description ?? "Encode and decode HTML entities"}>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={() => run("encode")}>Encode</Button>
        <Button size="sm" variant="outline" onClick={() => run("decode")}>Decode</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="html" placeholder="<div>Hello</div>" />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="html" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default HtmlEntityPage;
