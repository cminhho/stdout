import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processBase64ForLayout,
  type Base64Mode,
  BASE64_FILE_ACCEPT,
  BASE64_SAMPLE,
  BASE64_SAMPLE_DECODE,
  BASE64_PLACEHOLDER_INPUT,
  BASE64_PLACEHOLDER_OUTPUT,
  BASE64_OUTPUT_FILENAME,
  BASE64_MIME_TYPE,
} from "@/utils/encode";

const MODE_OPTIONS: { value: Base64Mode; label: string }[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

const Base64Page = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");

  const setModeWithCleanup = useCallback((next: Base64Mode) => {
    setMode(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processBase64ForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(mode === "encode" ? BASE64_SAMPLE : BASE64_SAMPLE_DECODE),
          setInput,
          fileAccept: BASE64_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<Base64Mode>
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
          placeholder: BASE64_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: BASE64_OUTPUT_FILENAME,
          outputMimeType: BASE64_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "text",
          placeholder: BASE64_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default Base64Page;
