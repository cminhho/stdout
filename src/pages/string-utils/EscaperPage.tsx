import { useState } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { escapeText, unescapeText, type EscaperType } from "@/utils/escaper";

const SAMPLE_INPUT = 'Say "Hello" & <world>\nLine 2';

interface EscaperPageProps {
  type: EscaperType;
  /** Optional selector (e.g. dropdown) for format/type when used in unified tool */
  formatSelector?: React.ReactNode;
}

const EscaperPage = ({ type, formatSelector }: EscaperPageProps) => {
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

  const clearAll = () => {
    setInput("");
    setOutput("");
  };

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => { setInput(SAMPLE_INPUT); setOutput(""); },
          setInput: (v) => { setInput(v); setOutput(""); },
          fileAccept: accept,
          onFileText: (t) => { setInput(t); setOutput(""); },
        },
        onClear: clearAll,
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: "Enter text...",
        },
      }}
      outputPane={{
        copyText: output || undefined,
        toolbar: (
          <>
            {formatSelector}
            <Button size="xs" onClick={() => run("encode")}>Escape</Button>
            <Button size="xs" variant="outline" onClick={() => run("decode")}>Unescape</Button>
          </>
        ),
        outputEditor: {
          value: output,
          language: "text",
          placeholder: "Result...",
        },
      }}
    />
  );
};

export default EscaperPage;
