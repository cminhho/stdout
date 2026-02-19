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
  parseEnv,
  formatEnvOutput,
  type EnvOutputFormat,
  ENV_NETLIFY_FILE_ACCEPT,
  ENV_NETLIFY_SAMPLE,
  ENV_NETLIFY_PLACEHOLDER_INPUT,
  ENV_NETLIFY_PLACEHOLDER_OUTPUT,
} from "@/utils/envNetlify";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const EnvNetlifyPage = () => {
  const tool = useCurrentTool();
  const [envInput, setEnvInput] = useState("");
  const [format, setFormat] = useState<EnvOutputFormat>("netlify");
  const [yamlIndent, setYamlIndent] = useState<IndentOption>(2);

  const output = useMemo(() => {
    const pairs = parseEnv(envInput);
    const space = typeof yamlIndent === "number" ? yamlIndent : 2;
    return formatEnvOutput(pairs, format, space);
  }, [envInput, format, yamlIndent]);

  const outputLang = format === "yaml" ? "yaml" : "env";

  return (
    <ToolLayout title={tool?.label ?? ".env Converter"} description={tool?.description ?? "Convert .env files to Netlify, Docker, YAML formats"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label=".env Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setEnvInput(ENV_NETLIFY_SAMPLE)} />
                <ClearButton onClick={() => setEnvInput("")} />
                <FileUploadButton accept={ENV_NETLIFY_FILE_ACCEPT} onText={setEnvInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={envInput} onChange={setEnvInput} language="env" placeholder={ENV_NETLIFY_PLACEHOLDER_INPUT} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Output"
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                {(["netlify", "docker", "yaml"] as const).map((f) => (
                  <Button key={f} size="sm" variant={format === f ? "default" : "outline"} onClick={() => setFormat(f)} className="h-7 text-xs">
                    {f === "netlify" ? "netlify.toml" : f === "docker" ? "Dockerfile" : "YAML"}
                  </Button>
                ))}
                {format === "yaml" && (
                  <IndentSelect
                    value={yamlIndent}
                    onChange={setYamlIndent}
                    spaceOptions={[2, 4]}
                    includeTab={false}
                    includeMinified={false}
                    className={selectClass}
                  />
                )}
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language={outputLang} placeholder={ENV_NETLIFY_PLACEHOLDER_OUTPUT} fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default EnvNetlifyPage;
