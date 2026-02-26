import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/common/SegmentGroup";
import type { IndentOption } from "@/components/common/IndentSelect";
import {
  processUrlEncodeForLayout,
  type UrlEncodeMode,
  URL_ENCODE_FILE_ACCEPT,
  URL_ENCODE_SAMPLE,
  URL_ENCODE_SAMPLE_DECODE,
  URL_ENCODE_PLACEHOLDER_INPUT,
  URL_ENCODE_PLACEHOLDER_OUTPUT,
  URL_ENCODE_OUTPUT_FILENAME,
  URL_ENCODE_MIME_TYPE,
} from "@/utils/urlEncode";

const MODE_OPTIONS: { value: UrlEncodeMode; label: string }[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

const UrlEncodePage = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<UrlEncodeMode>("encode");

  const setModeWithCleanup = useCallback((next: UrlEncodeMode) => {
    setMode(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processUrlEncodeForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(mode === "encode" ? URL_ENCODE_SAMPLE : URL_ENCODE_SAMPLE_DECODE),
          setInput,
          fileAccept: URL_ENCODE_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<UrlEncodeMode>
            value={mode}
            onValueChange={setModeWithCleanup}
            options={MODE_OPTIONS}
            ariaLabel="Mode"
          />
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: URL_ENCODE_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: URL_ENCODE_OUTPUT_FILENAME,
          outputMimeType: URL_ENCODE_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "text",
          placeholder: URL_ENCODE_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default UrlEncodePage;
