import { useState, useEffect, useMemo } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
import ValidationErrorList from "@/components/ValidationErrorList";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { singleErrorToParseErrors } from "@/utils/validationTypes";
import { htmlBeautify } from "@/utils/beautifier";
import { validateHtml } from "@/utils/validators";

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Sample</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <header><h1>Hello</h1></header>
    <main>
      <p>Edit this HTML and use Beautify or Minify.</p>
      <ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>
    </main>
    <footer><p>&copy; Example</p></footer>
  </div>
</body>
</html>`;

const minifyHtml = (html: string): string =>
  html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const HtmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(
    '<div class="container"><h1>Hello</h1><p>World</p><ul><li>Item 1</li><li>Item 2</li></ul></div>'
  );
  const [output, setOutput] = useState("");
  const [indentOption, setIndentOption] = useState<IndentOption>(2);
  const [loading, setLoading] = useState(false);

  const validation = useMemo(() => validateHtml(input), [input]);
  const validationErrors = useMemo(
    () => (validation.valid || !validation.error ? [] : singleErrorToParseErrors(validation.error)),
    [validation]
  );
  const errorLineSet = useMemo(
    () => new Set(validationErrors.map((e) => e.line)),
    [validationErrors]
  );

  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    if (indentOption === "minified") {
      setOutput(minifyHtml(input));
      return;
    }
    setLoading(true);
    setOutput("");
    let cancelled = false;
    const indentNum = indentOption === "tab" ? 2 : (indentOption as number);
    const useTabs = indentOption === "tab";
    htmlBeautify(input, indentNum, useTabs)
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

  const loadSample = () => setInput(SAMPLE_HTML);
  const clearInput = () => setInput("");
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <ToolLayout title={tool?.label ?? "HTML Beautify/Minify/Validate"} description={tool?.description ?? "Beautify, minify & validate HTML"}>
      {hasValidationErrors ? (
        <div className="mb-3">
          <ValidationErrorList errors={validationErrors} />
        </div>
      ) : null}
      <ResizableTwoPanel
        defaultInputPercent={50}
        input={{
          toolbar: (
            <>
              <SampleButton onClick={loadSample} />
              <ClearButton onClick={clearInput} />
              <FileUploadButton accept=".html,.htm,text/html" onText={setInput} />
            </>
          ),
          children: (
            <CodeEditor
              value={input}
              onChange={setInput}
              language="html"
              placeholder="<div>...</div>"
              errorLines={errorLineSet}
              fillHeight
            />
          ),
        }}
        output={{
          copyText: output,
          toolbar: (
            <>
              <IndentSelect value={indentOption} onChange={setIndentOption} />
              {output ? (
                <SaveButton content={output} filename="output.html" mimeType="text/html" />
              ) : null}
            </>
          ),
          children: (
            <CodeEditor
              key={`result-${indentOption}`}
              value={output}
              readOnly
              language="html"
              placeholder={loading ? "Formatting…" : "Result will appear here..."}
              fillHeight
            />
          ),
        }}
      />
    </ToolLayout>
  );
};

export default HtmlFormatterPage;
