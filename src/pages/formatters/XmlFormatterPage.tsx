import { useState } from "react";
import type { IndentOption } from "@/components/IndentSelect";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
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

const DEFAULT_INPUT =
  '<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>Advanced XML</title><author>Jane</author><price>39.99</price></book></catalog>';

function formatXmlWithValidation(input: string, indent: IndentOption) {
  const validation = validateXml(input);
  const errors =
    validation.valid || !validation.error ? [] : singleErrorToParseErrors(validation.error);
  const output = !input.trim()
    ? ""
    : indent === "minified"
      ? minifyXml(input)
      : formatXml(input, indent === "tab" ? 2 : (indent as number), indent === "tab");
  return { output, errors };
}

const XmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(DEFAULT_INPUT);

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_XML),
          setInput,
          fileAccept: ".xml,application/xml,text/xml",
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "xml",
          placeholder: '<?xml version="1.0"?>...',
        },
      }}
      outputPane={{
        outputToolbar: {
          format: formatXmlWithValidation,
          outputFilename: "output.xml",
          outputMimeType: "application/xml",
        },
        outputEditor: {
          value: "",
          language: "xml",
          placeholder: "Result will appear here...",
        },
      }}
    />
  );
};

export default XmlFormatterPage;
