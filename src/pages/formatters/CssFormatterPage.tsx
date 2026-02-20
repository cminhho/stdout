import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import {
  CSS_FILE_ACCEPT,
  CSS_FORMATTER_SAMPLE,
  CSS_INPUT_PLACEHOLDER,
  CSS_LANGUAGE,
  CSS_MIME_TYPE,
  CSS_OUTPUT_FILENAME,
  CSS_OUTPUT_PLACEHOLDER,
  processCssInput,
} from "@/utils/cssFormat";

const CssFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(CSS_FORMATTER_SAMPLE),
          setInput,
          fileAccept: CSS_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: CSS_LANGUAGE,
          placeholder: CSS_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: (inputValue, indent) => processCssInput(inputValue, indent),
          outputFilename: CSS_OUTPUT_FILENAME,
          outputMimeType: CSS_MIME_TYPE,
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: CSS_LANGUAGE,
          placeholder: CSS_OUTPUT_PLACEHOLDER,
        },
      }}
    />
  );
};

export default CssFormatterPage;
