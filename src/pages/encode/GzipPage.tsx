import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processGzipForLayout,
  type GzipMode,
  GZIP_FILE_ACCEPT,
  GZIP_SAMPLE,
  GZIP_PLACEHOLDER_INPUT,
  GZIP_PLACEHOLDER_OUTPUT,
  GZIP_OUTPUT_FILENAME,
  GZIP_MIME_TYPE,
} from "@/utils/gzip";

const GzipPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<GzipMode>("compress");

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processGzipForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        onClear: () => setInput(""),
        toolbar: (
          <>
            <Button size="sm" variant={mode === "compress" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("compress")}>
              Compress
            </Button>
            <Button size="sm" variant={mode === "decompress" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("decompress")}>
              Decompress
            </Button>
            <SampleButton onClick={() => setInput(GZIP_SAMPLE)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={GZIP_FILE_ACCEPT} onText={setInput} />
          </>
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
