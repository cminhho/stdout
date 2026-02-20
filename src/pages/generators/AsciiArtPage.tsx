import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processAsciiArtForLayout,
  type AsciiArtCharStyle,
  ASCII_ART_FILE_ACCEPT,
  ASCII_ART_SAMPLE,
  ASCII_ART_PLACEHOLDER_INPUT,
  ASCII_ART_PLACEHOLDER_OUTPUT,
  ASCII_ART_OUTPUT_FILENAME,
  ASCII_ART_MIME_TYPE,
  ASCII_ART_CHAR_STYLES,
  ASCII_ART_SPACING_OPTIONS,
} from "@/utils/asciiArt";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const AsciiArtPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(ASCII_ART_SAMPLE);
  const [charStyle, setCharStyle] = useState<AsciiArtCharStyle>("block");
  const [spacing, setSpacing] = useState(2);

  const format = useCallback(
    (inputValue: string, _indent: IndentOption) => processAsciiArtForLayout(inputValue, charStyle, spacing),
    [charStyle, spacing]
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        onClear: () => setInput(""),
        toolbar: (
          <>
            <select value={charStyle} onChange={(e) => setCharStyle(e.target.value as AsciiArtCharStyle)} className={selectClass}>
              {ASCII_ART_CHAR_STYLES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <select value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} className={selectClass}>
              {ASCII_ART_SPACING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <SampleButton onClick={() => setInput(ASCII_ART_SAMPLE)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={ASCII_ART_FILE_ACCEPT} onText={setInput} />
          </>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: ASCII_ART_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: ASCII_ART_OUTPUT_FILENAME,
          outputMimeType: ASCII_ART_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "text",
          placeholder: ASCII_ART_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default AsciiArtPage;
