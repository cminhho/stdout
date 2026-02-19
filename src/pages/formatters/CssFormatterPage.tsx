import { useState, useEffect } from "react";
import CodeEditor from "@/components/CodeEditor";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
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

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_CSS),
          setInput: setInput,
          fileAccept: ".css,text/css",
          onFileText: setInput,
        },
        children: (
          <CodeEditor value={input} onChange={setInput} language="css" placeholder="body { margin: 0; }" fillHeight />
        ),
      }}
      outputPane={{
        copyText: output,
        outputToolbar: {
          indent: indentOption,
          onIndentChange: setIndentOption,
          outputContent: output,
          outputFilename: "output.css",
          outputMimeType: "text/css",
          indentIncludeTab: false,
        },
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
  );
};

export default CssFormatterPage;
