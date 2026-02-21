import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import { useCurrentTool } from "@/hooks/useCurrentTool";
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

const OUTPUT_FORMAT_OPTIONS: { value: EnvOutputFormat; label: string }[] = [
  { value: "netlify", label: "netlify.toml" },
  { value: "docker", label: "Dockerfile" },
  { value: "yaml", label: "YAML" },
];

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
        inputToolbar: {
          onSample: () => setInput(ENV_NETLIFY_SAMPLE),
          setInput,
          fileAccept: ENV_NETLIFY_FILE_ACCEPT,
          onFileText: setInput,
        },
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
        outputToolbarExtra: (
          <SegmentGroup<EnvOutputFormat>
            value={outputFormat}
            onValueChange={setOutputFormat}
            options={OUTPUT_FORMAT_OPTIONS}
            ariaLabel="Output format"
          />
        ),
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
