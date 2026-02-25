import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import {
  JSON_FILE_ACCEPT,
  JSON_FORMATTER_SAMPLE,
  JSON_INPUT_PLACEHOLDER,
  JSON_LANGUAGE,
  JSON_MIME_TYPE,
  JSON_OUTPUT_FILENAME,
  JSON_OUTPUT_PLACEHOLDER,
  processJsonInput,
} from "@/utils/jsonFormat";

const JsonFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(JSON_FORMATTER_SAMPLE),
          setInput,
          fileAccept: JSON_FILE_ACCEPT,
          onFileText: setInput,
        },
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
