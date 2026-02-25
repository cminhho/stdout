import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processGzipForLayout,
  type GzipMode,
  GZIP_FILE_ACCEPT,
  GZIP_SAMPLE,
  GZIP_SAMPLE_DECODE,
  GZIP_PLACEHOLDER_INPUT,
  GZIP_PLACEHOLDER_OUTPUT,
  GZIP_OUTPUT_FILENAME,
  GZIP_MIME_TYPE,
} from "@/utils/gzip";

const MODE_OPTIONS: { value: GzipMode; label: string }[] = [
  { value: "compress", label: "Compress" },
  { value: "decompress", label: "Decompress" },
];

const GzipPage = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<GzipMode>("compress");

  const setModeWithCleanup = useCallback((next: GzipMode) => {
    setMode(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processGzipForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(mode === "compress" ? GZIP_SAMPLE : GZIP_SAMPLE_DECODE),
          setInput,
          fileAccept: GZIP_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<GzipMode>
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
          placeholder: GZIP_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: GZIP_OUTPUT_FILENAME,
          outputMimeType: GZIP_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "text",
          placeholder: GZIP_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default GzipPage;
