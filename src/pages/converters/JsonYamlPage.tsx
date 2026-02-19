import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processJsonToYaml,
  JSON_YAML_FILE_ACCEPT,
  JSON_YAML_SAMPLE_JSON,
  JSON_YAML_PLACEHOLDER_INPUT,
  JSON_YAML_PLACEHOLDER_OUTPUT,
  JSON_YAML_OUTPUT_FILENAME,
  JSON_YAML_MIME_TYPE,
  JSON_YAML_LANGUAGE,
} from "@/utils/jsonYaml";

const JsonYamlPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  const format = useCallback((inputValue: string, indent: IndentOption) => {
    const spaces = indent === "minified" ? 0 : indent === "tab" ? 2 : (indent as number);
    return processJsonToYaml(inputValue, spaces);
  }, []);

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(JSON_YAML_SAMPLE_JSON),
          setInput,
          fileAccept: JSON_YAML_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: JSON_YAML_LANGUAGE,
          placeholder: JSON_YAML_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: JSON_YAML_OUTPUT_FILENAME,
          outputMimeType: JSON_YAML_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "yaml",
          placeholder: JSON_YAML_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default JsonYamlPage;
