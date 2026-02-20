import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
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

const CsvJsonPage = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<CsvJsonMode>("csv2json");
  const [input, setInput] = useState("");

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
        toolbar: (
          <>
            <Button size="sm" variant={mode === "csv2json" ? "default" : "outline"} onClick={() => setMode("csv2json")} className="h-7 text-xs">
              CSV → JSON
            </Button>
            <Button size="sm" variant={mode === "json2csv" ? "default" : "outline"} onClick={() => setMode("json2csv")} className="h-7 text-xs">
              JSON → CSV
            </Button>
            <SampleButton onClick={() => setInput(sampleInput)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={CSV_JSON_FILE_ACCEPT} onText={setInput} />
          </>
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
