import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processBase64ForLayout,
  type Base64Mode,
  BASE64_FILE_ACCEPT,
  BASE64_SAMPLE,
  BASE64_PLACEHOLDER_INPUT,
  BASE64_PLACEHOLDER_OUTPUT,
  BASE64_OUTPUT_FILENAME,
  BASE64_MIME_TYPE,
} from "@/utils/encode";

const Base64Page = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Base64Mode>("encode");

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processBase64ForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(BASE64_SAMPLE),
          setInput,
          fileAccept: BASE64_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <>
            <Button size="sm" variant={mode === "encode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("encode")}>
              Encode
            </Button>
            <Button size="sm" variant={mode === "decode" ? "default" : "outline"} className="h-7 text-xs" onClick={() => setMode("decode")}>
              Decode
            </Button>
          </>
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
