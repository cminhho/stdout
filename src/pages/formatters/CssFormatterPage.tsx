import { useState } from "react";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import type { FormatResult } from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { cssBeautify } from "@/utils/beautifier";
import { cssMinify } from "@/utils/minify";

const SAMPLE_CSS = `body { margin: 0; padding: 0; font-family: sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 20px; }
.header { background: #333; color: #fff; padding: 10px 20px; }
.main { display: flex; gap: 1rem; }
.footer { margin-top: 2rem; text-align: center; }`;

const DEFAULT_INPUT =
  "body{margin:0;padding:0;font-family:sans-serif}.container{max-width:1200px;margin:0 auto;padding:20px}.header{background:#333;color:#fff;padding:10px 20px}";

function formatCss(input: string, indent: IndentOption): Promise<FormatResult> {
  if (!input.trim()) return Promise.resolve({ output: "" });
  const run =
    indent === "minified"
      ? () => cssMinify(input)
      : () => cssBeautify(input, typeof indent === "number" ? indent : 2);
  return run()
    .then((output) => ({ output }))
    .catch((err) => ({
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
    }));
}

const CssFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(DEFAULT_INPUT);

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_CSS),
          setInput,
          fileAccept: ".css,text/css",
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "css",
          placeholder: "body { margin: 0; }",
        },
      }}
      outputPane={{
        outputToolbar: {
          format: formatCss,
          outputFilename: "output.css",
          outputMimeType: "text/css",
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "css",
          placeholder: "Result will appear here...",
        },
      }}
    />
  );
};

export default CssFormatterPage;
