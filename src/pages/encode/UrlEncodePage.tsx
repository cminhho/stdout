import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processUrlEncodeForLayout,
  type UrlEncodeMode,
  URL_ENCODE_FILE_ACCEPT,
  URL_ENCODE_SAMPLE,
  URL_ENCODE_PLACEHOLDER_INPUT,
  URL_ENCODE_PLACEHOLDER_OUTPUT,
  URL_ENCODE_OUTPUT_FILENAME,
  URL_ENCODE_MIME_TYPE,
} from "@/utils/urlEncode";

const UrlEncodePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<UrlEncodeMode>("encode");

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processUrlEncodeForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        onClear: () => setInput(""),
        toolbar: (
          <>
            <Button size="sm" variant={mode === "encode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("encode")}>
              Encode
            </Button>
            <Button size="sm" variant={mode === "decode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("decode")}>
              Decode
            </Button>
            <SampleButton onClick={() => setInput(URL_ENCODE_SAMPLE)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={URL_ENCODE_FILE_ACCEPT} onText={setInput} />
          </>
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
