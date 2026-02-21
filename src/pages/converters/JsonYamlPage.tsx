import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processJsonToYaml,
  processYamlToJson,
  type JsonYamlDirection,
  JSON_YAML_FILE_ACCEPT_JSON,
  JSON_YAML_FILE_ACCEPT_YAML,
  JSON_YAML_SAMPLE_JSON,
  JSON_YAML_SAMPLE_YAML,
  JSON_YAML_PLACEHOLDER_JSON,
  JSON_YAML_PLACEHOLDER_YAML,
  JSON_YAML_PLACEHOLDER_OUTPUT,
  JSON_YAML_OUTPUT_FILENAME_YAML,
  JSON_YAML_OUTPUT_FILENAME_JSON,
  JSON_YAML_MIME_TYPE_YAML,
  JSON_YAML_MIME_TYPE_JSON,
} from "@/utils/jsonYaml";

const DIRECTION_OPTIONS: { value: JsonYamlDirection; label: string }[] = [
  { value: "json-to-yaml", label: "JSON → YAML" },
  { value: "yaml-to-json", label: "YAML → JSON" },
];

const JsonYamlPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [direction, setDirection] = useState<JsonYamlDirection>("json-to-yaml");

  const setDirectionWithCleanup = useCallback((next: JsonYamlDirection) => {
    setDirection(next);
    setInput("");
  }, []);

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => {
      const spaces =
        indent === "minified" ? 0 : indent === "tab" ? 2 : (indent as number);
      return direction === "json-to-yaml"
        ? processJsonToYaml(inputValue, spaces)
        : processYamlToJson(inputValue, spaces);
    },
    [direction]
  );

  const isJsonToYaml = direction === "json-to-yaml";

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () =>
            setInput(isJsonToYaml ? JSON_YAML_SAMPLE_JSON : JSON_YAML_SAMPLE_YAML),
          setInput,
          fileAccept: isJsonToYaml
            ? JSON_YAML_FILE_ACCEPT_JSON
            : JSON_YAML_FILE_ACCEPT_YAML,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<JsonYamlDirection>
            value={direction}
            onValueChange={setDirectionWithCleanup}
            options={DIRECTION_OPTIONS}
            ariaLabel="Conversion direction"
          />
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: isJsonToYaml ? "json" : "yaml",
          placeholder: isJsonToYaml
            ? JSON_YAML_PLACEHOLDER_JSON
            : JSON_YAML_PLACEHOLDER_YAML,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: isJsonToYaml
            ? JSON_YAML_OUTPUT_FILENAME_YAML
            : JSON_YAML_OUTPUT_FILENAME_JSON,
          outputMimeType: isJsonToYaml
            ? JSON_YAML_MIME_TYPE_YAML
            : JSON_YAML_MIME_TYPE_JSON,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: isJsonToYaml ? "yaml" : "json",
          placeholder: JSON_YAML_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default JsonYamlPage;
