import { useCallback, useState } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import SaveSessionButton from "@/components/common/SaveSessionButton";
import SavedSessionsPopover from "@/components/common/SavedSessionsPopover";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  JSON_FILE_ACCEPT,
  JSON_FORMATTER_SAMPLE,
  JSON_FORMATTER_SAMPLE_API,
  JSON_FORMATTER_SAMPLE_CONFIG,
  JSON_FORMATTER_SAMPLE_PACKAGE,
  JSON_FORMATTER_SAMPLE_TABLE,
  JSON_INPUT_PLACEHOLDER,
  JSON_LANGUAGE,
  JSON_MIME_TYPE,
  JSON_OUTPUT_FILENAME,
  JSON_OUTPUT_PLACEHOLDER,
  processJsonInput,
} from "@/utils/jsonFormat";

const INPUT_SAMPLES = [
  { id: "generic", label: "Generic (nested)", value: JSON_FORMATTER_SAMPLE },
  { id: "api", label: "API response", value: JSON_FORMATTER_SAMPLE_API },
  { id: "config", label: "App config", value: JSON_FORMATTER_SAMPLE_CONFIG },
  { id: "package", label: "package.json-like", value: JSON_FORMATTER_SAMPLE_PACKAGE },
  { id: "table", label: "Array of records", value: JSON_FORMATTER_SAMPLE_TABLE },
];

const JsonFormatterPage = () => {
  const tool = useCurrentTool();
  const { setToolState } = useWorkspace();
  const [input, setInput] = useState("");

  const handleLoadSession = useCallback(
    (state: { input?: string; scrollPosition?: number; splitPercent?: number }) => {
      if (state.input !== undefined) setInput(state.input);
      if (tool?.id) setToolState(tool.id, state);
    },
    [tool?.id, setToolState]
  );

  return (
    <TwoPanelToolLayout
      persistToolId={tool?.id}
      shareState={{ input }}
      inputPane={{
        inputToolbar: {
          onSample: (value) => setInput(value ?? JSON_FORMATTER_SAMPLE),
          samples: INPUT_SAMPLES,
          setInput,
          fileAccept: JSON_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: tool?.id ? (
          <>
            <SaveSessionButton toolId={tool.id} currentState={{ input }} />
            <SavedSessionsPopover toolId={tool.id} onLoad={handleLoadSession} />
          </>
        ) : undefined,
        inputEditor: {
          value: input,
          onChange: setInput,
          language: JSON_LANGUAGE,
          placeholder: JSON_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: (input, indent) => processJsonInput(input, indent),
          outputFilename: JSON_OUTPUT_FILENAME,
          outputMimeType: JSON_MIME_TYPE,
        },
        outputEditor: {
          value: "",
          language: JSON_LANGUAGE,
          placeholder: JSON_OUTPUT_PLACEHOLDER,
        },
      }}
    />
  );
};

export default JsonFormatterPage;
