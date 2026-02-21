import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processHtmlEntityForLayout,
  type HtmlEntityMode,
  HTML_ENTITY_FILE_ACCEPT,
  HTML_ENTITY_SAMPLE,
  HTML_ENTITY_PLACEHOLDER_INPUT,
  HTML_ENTITY_PLACEHOLDER_OUTPUT,
  HTML_ENTITY_OUTPUT_FILENAME,
  HTML_ENTITY_MIME_TYPE,
} from "@/utils/htmlEntity";

const HtmlEntityPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<HtmlEntityMode>("encode");

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processHtmlEntityForLayout(inputValue, mode),
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
            <SampleButton onClick={() => setInput(HTML_ENTITY_SAMPLE)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={HTML_ENTITY_FILE_ACCEPT} onText={setInput} />
          </>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "html",
          placeholder: HTML_ENTITY_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: HTML_ENTITY_OUTPUT_FILENAME,
          outputMimeType: HTML_ENTITY_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "html",
          placeholder: HTML_ENTITY_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default HtmlEntityPage;
