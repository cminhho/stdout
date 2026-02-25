import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
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

const MODE_OPTIONS: { value: JsonQueryStringMode; label: string }[] = [
  { value: "toQs", label: "JSON → QS" },
  { value: "toJson", label: "QS → JSON" },
];

const JsonQueryStringPage = () => {
  const [mode, setMode] = useState<JsonQueryStringMode>("toQs");
  const [input, setInput] = useState("");

  const setModeWithCleanup = useCallback((next: JsonQueryStringMode) => {
    setMode(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => processJsonQueryString(inputValue, indent, mode),
    [mode]
  );

  const isToQs = mode === "toQs";

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () =>
            setInput(isToQs ? JSON_QUERY_STRING_SAMPLE_JSON : JSON_QUERY_STRING_SAMPLE_QS),
          setInput,
          fileAccept: JSON_QUERY_STRING_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<JsonQueryStringMode>
            value={mode}
            onValueChange={setModeWithCleanup}
            options={MODE_OPTIONS}
            ariaLabel="Conversion direction"
          />
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: isToQs ? "json" : "text",
          placeholder: isToQs ? "Paste JSON..." : "Paste query string...",
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: isToQs
            ? JSON_QUERY_STRING_OUTPUT_FILENAME_QS
            : JSON_QUERY_STRING_OUTPUT_FILENAME_JSON,
          outputMimeType: isToQs ? JSON_QUERY_STRING_MIME_QS : JSON_QUERY_STRING_MIME_JSON,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: isToQs ? "text" : "json",
          placeholder: JSON_QUERY_STRING_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default JsonQueryStringPage;
