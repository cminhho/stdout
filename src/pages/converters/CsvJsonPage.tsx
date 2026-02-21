import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import type { IndentOption } from "@/components/IndentSelect";
import type { CsvJsonMode } from "@/utils/csvJson";
import {
  processCsvJson,
  CSV_JSON_FILE_ACCEPT,
  CSV_JSON_SAMPLE_CSV,
  CSV_JSON_SAMPLE_JSON,
  CSV_JSON_PLACEHOLDER_CSV,
  CSV_JSON_PLACEHOLDER_JSON,
  CSV_JSON_PLACEHOLDER_OUTPUT,
  CSV_JSON_OUTPUT_FILENAME_JSON,
  CSV_JSON_OUTPUT_FILENAME_CSV,
  CSV_JSON_MIME_JSON,
  CSV_JSON_MIME_CSV,
} from "@/utils/csvJson";

const MODE_OPTIONS: { value: CsvJsonMode; label: string }[] = [
  { value: "csv2json", label: "CSV → JSON" },
  { value: "json2csv", label: "JSON → CSV" },
];

const CsvJsonPage = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<CsvJsonMode>("csv2json");
  const [input, setInput] = useState("");

  const setModeWithCleanup = useCallback((next: CsvJsonMode) => {
    setMode(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => processCsvJson(inputValue, indent, mode),
    [mode]
  );

  const sampleInput = mode === "csv2json" ? CSV_JSON_SAMPLE_CSV : CSV_JSON_SAMPLE_JSON;
  const inputPlaceholder = mode === "csv2json" ? CSV_JSON_PLACEHOLDER_CSV : CSV_JSON_PLACEHOLDER_JSON;
  const inputLang = mode === "csv2json" ? "text" : "json";
  const outputLang = mode === "csv2json" ? "json" : "text";

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(sampleInput),
          setInput,
          fileAccept: CSV_JSON_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<CsvJsonMode>
            value={mode}
            onValueChange={setModeWithCleanup}
            options={MODE_OPTIONS}
            ariaLabel="Conversion direction"
          />
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: inputLang,
          placeholder: inputPlaceholder,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: mode === "csv2json" ? CSV_JSON_OUTPUT_FILENAME_JSON : CSV_JSON_OUTPUT_FILENAME_CSV,
          outputMimeType: mode === "csv2json" ? CSV_JSON_MIME_JSON : CSV_JSON_MIME_CSV,
        },
        outputEditor: {
          value: "",
          language: outputLang,
          placeholder: CSV_JSON_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default CsvJsonPage;
