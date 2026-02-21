import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
import { Button } from "@/components/ui/button";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processEnvNetlifyForLayout,
  type EnvOutputFormat,
  envOutputFilename,
  ENV_NETLIFY_FILE_ACCEPT,
  ENV_NETLIFY_SAMPLE,
  ENV_NETLIFY_PLACEHOLDER_INPUT,
  ENV_NETLIFY_PLACEHOLDER_OUTPUT,
  ENV_NETLIFY_MIME_TYPE,
} from "@/utils/envNetlify";

const EnvNetlifyPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [outputFormat, setOutputFormat] = useState<EnvOutputFormat>("netlify");

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => processEnvNetlifyForLayout(inputValue, indent, outputFormat),
    [outputFormat]
  );

  const outputLang = outputFormat === "yaml" ? "yaml" : "env";

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        onClear: () => setInput(""),
        toolbar: (
          <>
            {(["netlify", "docker", "yaml"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={outputFormat === f ? "default" : "outline"}
                onClick={() => setOutputFormat(f)}
                className="h-7 text-xs"
              >
                {f === "netlify" ? "netlify.toml" : f === "docker" ? "Dockerfile" : "YAML"}
              </Button>
            ))}
            <SampleButton onClick={() => setInput(ENV_NETLIFY_SAMPLE)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={ENV_NETLIFY_FILE_ACCEPT} onText={setInput} />
          </>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "env",
          placeholder: ENV_NETLIFY_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: envOutputFilename(outputFormat),
          outputMimeType: ENV_NETLIFY_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: outputLang,
          placeholder: ENV_NETLIFY_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default EnvNetlifyPage;
