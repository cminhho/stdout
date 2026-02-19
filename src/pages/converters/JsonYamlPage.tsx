import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import {
  jsonToYaml,
  JSON_YAML_FILE_ACCEPT,
  JSON_YAML_SAMPLE_JSON,
  JSON_YAML_PLACEHOLDER_INPUT,
  JSON_YAML_PLACEHOLDER_OUTPUT,
} from "@/utils/jsonYaml";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const JsonYamlPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const spacesPerLevel = typeof indent === "number" ? indent : 2;
  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      return { output: jsonToYaml(parsed, 0, spacesPerLevel), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, spacesPerLevel]);

  return (
    <ToolLayout title={tool?.label ?? "JSON ↔ YAML"} description={tool?.description ?? "Convert between JSON and YAML formats"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="JSON Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(JSON_YAML_SAMPLE_JSON)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={JSON_YAML_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="json" placeholder={JSON_YAML_PLACEHOLDER_INPUT} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="YAML Output"
            text={output}
            extra={
              <IndentSelect
                value={indent}
                onChange={setIndent}
                spaceOptions={[2, 4]}
                includeTab={false}
                includeMinified={false}
                className={selectClass}
              />
            }
          />
          {error ? (
            <div className="code-block text-destructive flex-1 min-h-0 overflow-auto">{error}</div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={output} readOnly language="yaml" placeholder={JSON_YAML_PLACEHOLDER_OUTPUT} fillHeight />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
};

export default JsonYamlPage;
