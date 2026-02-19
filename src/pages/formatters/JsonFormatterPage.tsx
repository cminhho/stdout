import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
import ValidationErrorList from "@/components/ValidationErrorList";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { JSON_FORMATTER_SAMPLE, processJsonInput } from "@/utils/jsonFormat";

const JsonFormatterPage = () => {
  const tool = useCurrentTool();
  const [rawJson, setRawJson] = useState("");
  const [indent, setIndent] = useState<IndentOption>(4);

  const { output: formattedJson, errors: validationErrors } = useMemo(
    () => processJsonInput(rawJson, indent),
    [rawJson, indent]
  );
  const errorLineSet = useMemo(
    () => new Set(validationErrors.map((e) => e.line)),
    [validationErrors]
  );

  const loadSample = () => setRawJson(JSON_FORMATTER_SAMPLE);
  const clearInput = () => setRawJson("");
  const hasValidationErrors = validationErrors.length > 0;

  return (
    <ToolLayout title={tool?.label} description={tool?.description}>
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
              <FileUploadButton accept=".json,application/json" onText={setRawJson} />
            </>
          ),
          children: (
            <CodeEditor
              value={rawJson}
              onChange={setRawJson}
              language="json"
              placeholder="Paste JSON here..."
              errorLines={errorLineSet}
              fillHeight
            />
          ),
        }}
        output={{
          copyText: formattedJson,
          toolbar: (
            <>
              <IndentSelect value={indent} onChange={setIndent} />
              {formattedJson ? (
                <SaveButton
                  content={formattedJson}
                  filename="output.json"
                  mimeType="application/json"
                />
              ) : null}
            </>
          ),
          children: (
            <CodeEditor
              key={`result-${indent}`}
              value={formattedJson}
              readOnly
              language="json"
              placeholder="Result will appear here..."
              fillHeight
            />
          ),
        }}
      />
    </ToolLayout>
  );
};

export default JsonFormatterPage;
