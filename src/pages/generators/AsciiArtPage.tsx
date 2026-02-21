import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
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
        inputToolbar: {
          onSample: () => setInput(ASCII_ART_SAMPLE),
          setInput,
          fileAccept: ASCII_ART_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <>
            <SelectWithOptions
              size="sm"
              variant="secondary"
              value={charStyle}
              onValueChange={setCharStyle}
              options={ASCII_ART_CHAR_STYLES}
              title="Character style"
              aria-label="Character style"
            />
            <SelectWithOptions
              size="sm"
              variant="secondary"
              value={String(spacing)}
              onValueChange={(v) => setSpacing(Number(v))}
              options={ASCII_ART_SPACING_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
              title="Spacing"
              aria-label="Spacing"
            />
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
