import { useState, useEffect } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
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

const JsFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("function foo(){const a=1;return a+1;}");
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<IndentOption>(2);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (indentOption === "minified") {
      setLoading(true);
      setOutput("");
      let cancelled = false;
      jsMinify(input)
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
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const indentNum = indentOption === "tab" ? 2 : (indentOption as number);
    const useTabs = indentOption === "tab";
    jsBeautify(input, indentNum, useTabs)
      .then((formatted) => {
        if (!cancelled) setOutput(formatted);
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

  const loadSample = () => setInput(SAMPLE_JS);
  const clearInput = () => setInput("");

  return (
    <ToolLayout title={tool?.label ?? "JS Beautifier/Minifier"} description={tool?.description ?? "Beautify or minify JavaScript"}>
      <ResizableTwoPanel
        defaultInputPercent={50}
        input={{
          toolbar: (
            <>
              <SampleButton onClick={loadSample} />
              <ClearButton onClick={clearInput} />
              <FileUploadButton accept=".js,.mjs,.cjs,text/javascript" onText={setInput} />
            </>
          ),
          children: (
            <CodeEditor value={input} onChange={setInput} language="javascript" placeholder="Paste JavaScript..." fillHeight />
          ),
        }}
        output={{
          copyText: output,
          toolbar: (
            <>
              <IndentSelect value={indentOption} onChange={setIndentOption} />
              {output ? (
                <SaveButton content={output} filename="output.js" mimeType="text/javascript" />
              ) : null}
            </>
          ),
          children: (
            <CodeEditor
              key={`result-${indentOption}`}
              value={output}
              readOnly
              language="javascript"
              placeholder={loading ? "Processing…" : "Result..."}
              fillHeight
            />
          ),
        }}
      />
    </ToolLayout>
  );
};

export default JsFormatterPage;
