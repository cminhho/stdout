import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import { Button } from "@/components/ui/button";
import {
  csvToJson,
  jsonToCsv,
  CSV_JSON_FILE_ACCEPT,
  CSV_JSON_SAMPLE_CSV,
  CSV_JSON_SAMPLE_JSON,
  CSV_JSON_PLACEHOLDER_CSV,
  CSV_JSON_PLACEHOLDER_JSON,
  CSV_JSON_PLACEHOLDER_OUTPUT,
} from "@/utils/csvJson";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const CsvJsonPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"csv2json" | "json2csv">("csv2json");
  const [indent, setIndent] = useState<IndentOption>(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "csv2json") {
        const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
        return { output: JSON.stringify(csvToJson(input), null, space), error: "" };
      }
      const parsed = JSON.parse(input);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array");
      return { output: jsonToCsv(parsed), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, indent]);

  const inputLang = mode === "csv2json" ? "text" : "json";
  const outputLang = mode === "csv2json" ? "json" : "text";
  const sampleInput = mode === "csv2json" ? CSV_JSON_SAMPLE_CSV : CSV_JSON_SAMPLE_JSON;
  const inputPlaceholder = mode === "csv2json" ? CSV_JSON_PLACEHOLDER_CSV : CSV_JSON_PLACEHOLDER_JSON;

  return (
    <ToolLayout title={tool?.label ?? "CSV ↔ JSON"} description={tool?.description ?? "Convert between CSV and JSON formats"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <Button size="sm" variant={mode === "csv2json" ? "default" : "outline"} onClick={() => setMode("csv2json")} className="h-7 text-xs">
          CSV → JSON
        </Button>
        <Button size="sm" variant={mode === "json2csv" ? "default" : "outline"} onClick={() => setMode("json2csv")} className="h-7 text-xs">
          JSON → CSV
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "csv2json" ? "CSV Input" : "JSON Input"}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(sampleInput)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={CSV_JSON_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language={inputLang} placeholder={inputPlaceholder} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "csv2json" ? "JSON Output" : "CSV Output"}
            text={output}
            extra={mode === "csv2json" ? <IndentSelect value={indent} onChange={setIndent} className={selectClass} /> : undefined}
          />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language={outputLang} placeholder={CSV_JSON_PLACEHOLDER_OUTPUT} fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default CsvJsonPage;
