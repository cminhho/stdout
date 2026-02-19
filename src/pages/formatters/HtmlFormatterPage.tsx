import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import {
  HTML_FILE_ACCEPT,
  HTML_FORMATTER_SAMPLE,
  HTML_INPUT_PLACEHOLDER,
  HTML_LANGUAGE,
  HTML_MIME_TYPE,
  HTML_OUTPUT_FILENAME,
  HTML_OUTPUT_PLACEHOLDER,
  processHtmlInput,
} from "@/utils/htmlFormat";

const HtmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(HTML_FORMATTER_SAMPLE),
          setInput,
          fileAccept: HTML_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: HTML_LANGUAGE,
          placeholder: HTML_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: (inputValue, indent) => processHtmlInput(inputValue, indent),
          outputFilename: HTML_OUTPUT_FILENAME,
          outputMimeType: HTML_MIME_TYPE,
        },
        outputEditor: {
          value: "",
          language: HTML_LANGUAGE,
          placeholder: HTML_OUTPUT_PLACEHOLDER,
        },
      }}
    />
  );
};

export default HtmlFormatterPage;
