import { useState } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import {
  JSON_FILE_ACCEPT,
  JSON_FORMATTER_SAMPLE,
  JSON_FORMATTER_SAMPLE_INVALID,
  JSON_INPUT_PLACEHOLDER,
  JSON_LANGUAGE,
  JSON_MIME_TYPE,
  JSON_OUTPUT_FILENAME,
  JSON_OUTPUT_PLACEHOLDER,
  processJsonInput,
} from "@/utils/jsonFormat";

const INPUT_SAMPLES = [
  { id: "valid", label: "Valid (minified)", value: JSON_FORMATTER_SAMPLE },
  { id: "invalid", label: "Invalid (trailing comma)", value: JSON_FORMATTER_SAMPLE_INVALID },
];

const JsonFormatterPage = () => {
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: (value) => setInput(value ?? JSON_FORMATTER_SAMPLE),
          samples: INPUT_SAMPLES,
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
