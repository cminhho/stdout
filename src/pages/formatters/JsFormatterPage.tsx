import { useState } from "react";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import type { FormatResult } from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { jsBeautify } from "@/utils/beautifier";
import { jsMinify } from "@/utils/minify";

const SAMPLE_JS = `function greet(name) {
  return "Hello, " + name + "!";
}

const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

users.forEach((u) => {
  console.log(greet(u.name));
});

export { greet, users };
`;

const DEFAULT_INPUT = "function foo(){const a=1;return a+1;}";

function formatJs(input: string, indent: IndentOption): Promise<FormatResult> {
  if (!input.trim()) return Promise.resolve({ output: "" });
  if (indent === "minified") {
    return jsMinify(input)
      .then((output) => ({ output }))
      .catch((err) => ({
        output: `Error: ${err instanceof Error ? err.message : String(err)}`,
      }));
  }
  const indentNum = indent === "tab" ? 2 : (indent as number);
  const useTabs = indent === "tab";
  return jsBeautify(input, indentNum, useTabs)
    .then((output) => ({ output }))
    .catch((err) => ({
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
    }));
}

const JsFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(DEFAULT_INPUT);

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_JS),
          setInput,
          fileAccept: ".js,.mjs,.cjs,text/javascript",
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "javascript",
          placeholder: "Paste JavaScript...",
        },
      }}
      outputPane={{
        outputToolbar: {
          format: formatJs,
          outputFilename: "output.js",
          outputMimeType: "text/javascript",
        },
        outputEditor: {
          value: "",
          language: "javascript",
          placeholder: "Result...",
        },
      }}
    />
  );
};

export default JsFormatterPage;
