import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import type { JsonQueryStringMode } from "@/utils/jsonQueryString";
import {
  processJsonQueryString,
  JSON_QUERY_STRING_FILE_ACCEPT,
  JSON_QUERY_STRING_SAMPLE_JSON,
  JSON_QUERY_STRING_SAMPLE_QS,
  JSON_QUERY_STRING_PLACEHOLDER_OUTPUT,
  JSON_QUERY_STRING_OUTPUT_FILENAME_QS,
  JSON_QUERY_STRING_OUTPUT_FILENAME_JSON,
  JSON_QUERY_STRING_MIME_JSON,
  JSON_QUERY_STRING_MIME_QS,
} from "@/utils/jsonQueryString";

const JsonQueryStringPage = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<JsonQueryStringMode>("toQs");
  const [input, setInput] = useState("");

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => processJsonQueryString(inputValue, indent, mode),
    [mode]
  );

  const sampleInput = mode === "toQs" ? JSON_QUERY_STRING_SAMPLE_JSON : JSON_QUERY_STRING_SAMPLE_QS;
  const inputLang = mode === "toQs" ? "json" : "text";
  const outputLang = mode === "toQs" ? "text" : "json";

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        toolbar: (
          <>
            <Button size="sm" variant={mode === "toQs" ? "default" : "outline"} onClick={() => setMode("toQs")} className="h-7 text-xs">
              JSON → Query String
            </Button>
            <Button size="sm" variant={mode === "toJson" ? "default" : "outline"} onClick={() => setMode("toJson")} className="h-7 text-xs">
              Query String → JSON
            </Button>
            <SampleButton onClick={() => setInput(sampleInput)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={JSON_QUERY_STRING_FILE_ACCEPT} onText={setInput} />
          </>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: inputLang,
          placeholder: mode === "toQs" ? "Paste JSON..." : "Paste query string...",
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: mode === "toQs" ? JSON_QUERY_STRING_OUTPUT_FILENAME_QS : JSON_QUERY_STRING_OUTPUT_FILENAME_JSON,
          outputMimeType: mode === "toQs" ? JSON_QUERY_STRING_MIME_QS : JSON_QUERY_STRING_MIME_JSON,
        },
        outputEditor: {
          value: "",
          language: outputLang,
          placeholder: JSON_QUERY_STRING_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default JsonQueryStringPage;
