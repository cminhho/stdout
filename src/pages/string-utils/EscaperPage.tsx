import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { escapeText, unescapeText, type EscaperType } from "@/core-utils/escaper";

export interface EscaperPageProps {
  type: EscaperType;
  title: string;
  description: string;
}

const EscaperPage = ({ type, title, description }: EscaperPageProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (dir: "encode" | "decode") => {
    setOutput(dir === "encode" ? escapeText(type, input) : unescapeText(type, input));
  };

  return (
    <ToolLayout title={title} description={description}>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={() => run("encode")}>Escape</Button>
        <Button size="sm" variant="outline" onClick={() => run("decode")}>Unescape</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="text" placeholder="Result..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default EscaperPage;
