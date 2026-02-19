import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
import ValidationErrorList from "@/components/ValidationErrorList";
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
  const errorLineSet = useMemo(
    () => new Set(validationErrors.map((e) => e.line)),
    [validationErrors]
  );

  const output = useMemo(() => {
    if (!input.trim()) return "";
    if (indentOption === "minified") return minifyXml(input);
    const indentNum = indentOption === "tab" ? 2 : (indentOption as number);
    const useTabs = indentOption === "tab";
    return formatXml(input, indentNum, useTabs);
  }, [input, indentOption]);

  const loadSample = () => setInput(SAMPLE_XML);
  const clearInput = () => setInput("");
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <ToolLayout title={tool?.label ?? "XML Format/Validate"} description={tool?.description ?? "Beautify, minify & validate XML"}>
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
              <FileUploadButton accept=".xml,application/xml,text/xml" onText={setInput} />
            </>
          ),
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
        output={{
          copyText: output,
          toolbar: (
            <>
              <IndentSelect value={indentOption} onChange={setIndentOption} />
              {output ? (
                <SaveButton content={output} filename="output.xml" mimeType="application/xml" />
              ) : null}
            </>
          ),
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
    </ToolLayout>
  );
};

export default XmlFormatterPage;
