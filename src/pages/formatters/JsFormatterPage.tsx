import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import {
  JS_FILE_ACCEPT,
  JS_FORMATTER_SAMPLE,
  JS_INPUT_PLACEHOLDER,
  JS_LANGUAGE,
  JS_MIME_TYPE,
  JS_OUTPUT_FILENAME,
  JS_OUTPUT_PLACEHOLDER,
  processJsInput,
} from "@/utils/jsFormat";

const JsFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(JS_FORMATTER_SAMPLE),
          setInput,
          fileAccept: JS_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: JS_LANGUAGE,
          placeholder: JS_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: (inputValue, indent) => processJsInput(inputValue, indent),
          outputFilename: JS_OUTPUT_FILENAME,
          outputMimeType: JS_MIME_TYPE,
        },
        outputEditor: {
          value: "",
          language: JS_LANGUAGE,
          placeholder: JS_OUTPUT_PLACEHOLDER,
        },
      }}
    />
  );
};

export default JsFormatterPage;
