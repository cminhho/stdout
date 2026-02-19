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
  jsonToQueryString,
  queryStringToJson,
  JSON_QUERY_STRING_FILE_ACCEPT,
  JSON_QUERY_STRING_SAMPLE_JSON,
  JSON_QUERY_STRING_SAMPLE_QS,
  JSON_QUERY_STRING_PLACEHOLDER_OUTPUT,
} from "@/utils/jsonQueryString";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const JsonQueryStringPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"toQs" | "toJson">("toQs");
  const [indent, setIndent] = useState<IndentOption>(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "toQs") {
        const parsed = JSON.parse(input);
        return { output: jsonToQueryString(parsed), error: "" };
      }
      const obj = queryStringToJson(input);
      const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
      return { output: JSON.stringify(obj, null, space), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, indent]);

  const inputLang = mode === "toQs" ? "json" : "text";
  const outputLang = mode === "toQs" ? "text" : "json";
  const sampleInput = mode === "toQs" ? JSON_QUERY_STRING_SAMPLE_JSON : JSON_QUERY_STRING_SAMPLE_QS;

  return (
    <ToolLayout title={tool?.label ?? "JSON ↔ Query String"} description={tool?.description ?? "Convert between JSON and URL query strings"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <Button size="sm" variant={mode === "toQs" ? "default" : "outline"} onClick={() => setMode("toQs")} className="h-7 text-xs">
          JSON → Query String
        </Button>
        <Button size="sm" variant={mode === "toJson" ? "default" : "outline"} onClick={() => setMode("toJson")} className="h-7 text-xs">
          Query String → JSON
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "toQs" ? "JSON Input" : "Query String Input"}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(sampleInput)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={JSON_QUERY_STRING_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language={inputLang} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Output"
            text={output}
            extra={mode === "toJson" ? <IndentSelect value={indent} onChange={setIndent} className={selectClass} /> : undefined}
          />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language={outputLang} placeholder={JSON_QUERY_STRING_PLACEHOLDER_OUTPUT} fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonQueryStringPage;
