import { useState, useEffect, useMemo } from "react";
import CodeEditor from "@/components/CodeEditor";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useErrorLineSet } from "@/hooks/useErrorLineSet";
import { htmlBeautify } from "@/utils/beautifier";
import { singleErrorToParseErrors } from "@/utils/validationTypes";
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
  const errorLineSet = useErrorLineSet(validationErrors);

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

  return (
    <TwoPanelToolLayout
      tool={tool}
      validationErrors={validationErrors}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_HTML),
          setInput: setInput,
          fileAccept: ".html,.htm,text/html",
          onFileText: setInput,
        },
        onClear: clearInput,
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
      outputPane={{
        copyText: output,
        outputToolbar: {
          indent: indentOption,
          onIndentChange: setIndentOption,
          outputContent: output,
          outputFilename: "output.html",
          outputMimeType: "text/html",
        },
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
  );
};

export default HtmlFormatterPage;
