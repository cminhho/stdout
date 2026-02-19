import { useState } from "react";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import type { FormatResult } from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
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

const DEFAULT_INPUT =
  '<div class="container"><h1>Hello</h1><p>World</p><ul><li>Item 1</li><li>Item 2</li></ul></div>';

const minifyHtml = (html: string): string =>
  html.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

function formatHtmlWithValidation(input: string, indent: IndentOption): FormatResult | Promise<FormatResult> {
  const validation = validateHtml(input);
  const errors =
    validation.valid || !validation.error ? [] : singleErrorToParseErrors(validation.error);
  if (!input.trim()) return { output: "", errors };
  if (indent === "minified") return { output: minifyHtml(input), errors };
  const indentNum = indent === "tab" ? 2 : (indent as number);
  const useTabs = indent === "tab";
  return htmlBeautify(input, indentNum, useTabs)
    .then((output) => ({ output, errors }))
    .catch((err) => ({
      output: `Error: ${err instanceof Error ? err.message : String(err)}`,
      errors,
    }));
}

const HtmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(DEFAULT_INPUT);

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_HTML),
          setInput,
          fileAccept: ".html,.htm,text/html",
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "html",
          placeholder: "<div>...</div>",
        },
      }}
      outputPane={{
        outputToolbar: {
          format: formatHtmlWithValidation,
          outputFilename: "output.html",
          outputMimeType: "text/html",
        },
        outputEditor: {
          value: "",
          language: "html",
          placeholder: "Result will appear here...",
        },
      }}
    />
  );
};

export default HtmlFormatterPage;
