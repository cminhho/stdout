import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useErrorLineSet } from "@/hooks/useErrorLineSet";
import { singleErrorToParseErrors } from "@/utils/validationTypes";
import { validateXml } from "@/utils/validators";
import { formatXml, minifyXml } from "@/utils/xmlFormat";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Guide</title>
    <author>John Doe</author>
    <price>29.99</price>
  </book>
  <book id="2">
    <title>Advanced XML</title>
    <author>Jane Smith</author>
    <price>39.99</price>
  </book>
</catalog>`;

const XmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(
    '<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>Advanced XML</title><author>Jane</author><price>39.99</price></book></catalog>'
  );
  const [indentOption, setIndentOption] = useState<IndentOption>(2);

  const validation = useMemo(() => validateXml(input), [input]);
  const validationErrors = useMemo(
    () => (validation.valid || !validation.error ? [] : singleErrorToParseErrors(validation.error)),
    [validation]
  );
  const errorLineSet = useErrorLineSet(validationErrors);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    if (indentOption === "minified") return minifyXml(input);
    const indentNum = indentOption === "tab" ? 2 : (indentOption as number);
    const useTabs = indentOption === "tab";
    return formatXml(input, indentNum, useTabs);
  }, [input, indentOption]);

  return (
    <TwoPanelToolLayout
      tool={tool}
      validationErrors={validationErrors}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_XML),
          setInput: setInput,
          fileAccept: ".xml,application/xml,text/xml",
          onFileText: setInput,
        },
        children: (
          <CodeEditor
            value={input}
            onChange={setInput}
            language="xml"
            placeholder='<?xml version="1.0"?>...'
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
          outputFilename: "output.xml",
          outputMimeType: "application/xml",
        },
        children: (
          <CodeEditor
            key={`result-${indentOption}`}
            value={output}
            readOnly
            language="xml"
            placeholder="Result will appear here..."
            fillHeight
          />
        ),
      }}
    />
  );
};

export default XmlFormatterPage;
