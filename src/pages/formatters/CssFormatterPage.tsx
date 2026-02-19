import { useState, useEffect } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { cssBeautify } from "@/utils/beautifier";
import { cssMinify } from "@/utils/minify";

const SAMPLE_CSS = `body { margin: 0; padding: 0; font-family: sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { background: #333; color: #fff; padding: 10px 20px; }
.main { display: flex; gap: 1rem; }
.footer { margin-top: 2rem; text-align: center; }`;

const CssFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(
    "body{margin:0;padding:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:20px}.header{background:#333;color:#fff;padding:10px 20px}"
  );
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<IndentOption>(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const run =
      indentOption === "minified"
        ? () => cssMinify(input)
        : () => cssBeautify(input, typeof indentOption === "number" ? indentOption : 2);
    run()
      .then((result) => {
        if (!cancelled) setOutput(result);
      })
      .catch((err) => {
        if (!cancelled) setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [input, indentOption]);

  const loadSample = () => setInput(SAMPLE_CSS);
  const clearInput = () => setInput("");

  return (
    <ToolLayout title={tool?.label ?? "CSS Beautifier/Minifier"} description={tool?.description ?? "Beautify or minify CSS"}>
      <ResizableTwoPanel
        defaultInputPercent={50}
        input={{
          toolbar: (
            <>
              <SampleButton onClick={loadSample} />
              <ClearButton onClick={clearInput} />
              <FileUploadButton accept=".css,text/css" onText={setInput} />
            </>
          ),
          children: (
            <CodeEditor value={input} onChange={setInput} language="css" placeholder="body { margin: 0; }" fillHeight />
          ),
        }}
        output={{
          copyText: output,
          toolbar: (
            <>
              <IndentSelect value={indentOption} onChange={setIndentOption} includeTab={false} />
              {output ? (
                <SaveButton content={output} filename="output.css" mimeType="text/css" />
              ) : null}
            </>
          ),
          children: (
            <CodeEditor
              key={`result-${indentOption}`}
              value={output}
              readOnly
              language="css"
              placeholder={loading ? "Formatting…" : "Result will appear here..."}
              fillHeight
            />
          ),
        }}
      />
    </ToolLayout>
  );
};

export default CssFormatterPage;
