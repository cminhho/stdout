import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processHtmlEntityForLayout,
  type HtmlEntityMode,
  HTML_ENTITY_FILE_ACCEPT,
  HTML_ENTITY_SAMPLE_ENCODE,
  HTML_ENTITY_SAMPLE_DECODE,
  HTML_ENTITY_PLACEHOLDER_INPUT,
  HTML_ENTITY_PLACEHOLDER_OUTPUT,
  HTML_ENTITY_OUTPUT_FILENAME,
  HTML_ENTITY_MIME_TYPE,
} from "@/utils/htmlEntity";

const MODE_OPTIONS: { value: HtmlEntityMode; label: string }[] = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

const HtmlEntityPage = () => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<HtmlEntityMode>("encode");

  const setModeWithCleanup = useCallback((next: HtmlEntityMode) => {
    setMode(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processHtmlEntityForLayout(inputValue, mode),
    [mode]
  );

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(mode === "encode" ? HTML_ENTITY_SAMPLE_ENCODE : HTML_ENTITY_SAMPLE_DECODE),
          setInput,
          fileAccept: HTML_ENTITY_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<HtmlEntityMode>
            value={mode}
            onValueChange={setModeWithCleanup}
            options={MODE_OPTIONS}
            ariaLabel="Mode"
          />
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
