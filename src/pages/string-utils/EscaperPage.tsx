import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import { escapeText, unescapeText, type EscaperType } from "@/utils/escaper";

const SAMPLE_INPUT = 'Say "Hello" & <world>\nLine 2';

interface EscaperPageProps {
  type: EscaperType;
  title: string;
  description: string;
  /** Optional selector (e.g. dropdown) for format/type when used in unified tool */
  formatSelector?: React.ReactNode;
}

const EscaperPage = ({ type, title, description, formatSelector }: EscaperPageProps) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const run = (dir: "encode" | "decode") => {
    setOutput(dir === "encode" ? escapeText(type, input) : unescapeText(type, input));
  };

  const accept = formatSelector
    ? ".json,.csv,.xml,.sql,.js,text/plain,application/json,text/csv,text/xml,application/javascript"
    : type === "json"
      ? ".json,application/json,text/plain"
      : ".csv,text/csv,text/plain";

  return (
    <ToolLayout title={title} description={description}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Input"
            extra={
              <div className="flex items-center gap-2">
                <SampleButton onClick={() => { setInput(SAMPLE_INPUT); setOutput(""); }} />
                <ClearButton onClick={() => { setInput(""); setOutput(""); }} />
                <FileUploadButton accept={accept} onText={(t) => { setInput(t); setOutput(""); }} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder="Enter text..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Output"
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                {formatSelector}
                <Button size="sm" className="h-7 text-xs" onClick={() => run("encode")}>Escape</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => run("decode")}>Unescape</Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="text" placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default EscaperPage;
