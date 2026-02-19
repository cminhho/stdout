import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import { SampleButton, ClearButton, SaveButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import ValidationErrorList from "@/components/ValidationErrorList";
import { processJsonInput } from "@/utils/jsonFormat";
import { JSON_FORMATTER_SAMPLE } from "@/utils/samples/jsonFormatter";

const JsonFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(4);

  const { output, errors } = useMemo(
    () => processJsonInput(input, indent),
    [input, indent]
  );

  const errorLineSet = useMemo(() => new Set(errors.map((e) => e.line)), [errors]);

  const inputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <SampleButton onClick={() => setInput(JSON_FORMATTER_SAMPLE)} />
      <ClearButton onClick={() => setInput("")} />
      <FileUploadButton accept=".json,application/json" onText={setInput} />
    </div>
  );

  const outputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <IndentSelect value={indent} onChange={setIndent} />
      {output ? (
        <SaveButton content={output} filename="output.json" mimeType="application/json" />
      ) : null}
    </div>
  );

  return (
    <ToolLayout
      title={tool?.label}
      description={tool?.description}
    >
      {errors.length > 0 && (
        <div className="mb-3">
          <ValidationErrorList errors={errors} />
        </div>
      )}

      <ResizableTwoPanel
        primary={{
          label: "Input",
          extra: inputExtra,
          children: (
            <CodeEditor
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Paste JSON here..."
              errorLines={errorLineSet}
              fillHeight
            />
          ),
        }}
        secondary={{
          label: "Output",
          text: output,
          extra: outputExtra,
          children: (
            <CodeEditor
              key={`result-${indent}`}
              value={output}
              readOnly
              language="json"
              placeholder="Result will appear here..."
              fillHeight
            />
          ),
        }}
        defaultPrimaryPercent={50}
      />
    </ToolLayout>
  );
};

export default JsonFormatterPage;
