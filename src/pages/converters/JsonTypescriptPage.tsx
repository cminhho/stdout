import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import {
  processJsonToTypes,
  type JsonTypescriptLang,
  JSON_TYPESCRIPT_FILE_ACCEPT,
  JSON_TYPESCRIPT_SAMPLE,
  JSON_TYPESCRIPT_LANGS,
  JSON_TYPESCRIPT_PLACEHOLDER_OUTPUT,
} from "@/utils/jsonTypescript";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const JsonTypescriptPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [lang, setLang] = useState<JsonTypescriptLang>("typescript");
  const [indent, setIndent] = useState<IndentOption>(2);

  const indentNum = typeof indent === "number" ? indent : 2;
  const { output, error } = useMemo(
    () => processJsonToTypes(input, lang, indentNum),
    [input, lang, indentNum]
  );

  const currentLang = JSON_TYPESCRIPT_LANGS.find((l) => l.value === lang)!;

  return (
    <ToolLayout title={tool?.label ?? "JSON → Types"} description={tool?.description ?? "Generate TypeScript types from JSON"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="JSON Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(JSON_TYPESCRIPT_SAMPLE)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={JSON_TYPESCRIPT_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="json" fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={`${currentLang.label} Output`}
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <select value={lang} onChange={(e) => setLang(e.target.value as JsonTypescriptLang)} className={selectClass}>
                  {JSON_TYPESCRIPT_LANGS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <IndentSelect value={indent} onChange={setIndent} includeTab={false} includeMinified={false} className={selectClass} />
              </div>
            }
          />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language={currentLang.editorLang} placeholder={JSON_TYPESCRIPT_PLACEHOLDER_OUTPUT} fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonTypescriptPage;
