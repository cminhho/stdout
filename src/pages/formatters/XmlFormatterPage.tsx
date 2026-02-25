import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import {
  XML_FILE_ACCEPT,
  XML_FORMATTER_SAMPLE,
  XML_INPUT_PLACEHOLDER,
  XML_LANGUAGE,
  XML_MIME_TYPE,
  XML_OUTPUT_FILENAME,
  XML_OUTPUT_PLACEHOLDER,
  processXmlInput,
} from "@/utils/xmlFormat";

const XmlFormatterPage = () => {
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(XML_FORMATTER_SAMPLE),
          setInput,
          fileAccept: XML_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: XML_LANGUAGE,
          placeholder: XML_INPUT_PLACEHOLDER,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: (inputValue, indent) => processXmlInput(inputValue, indent),
          outputFilename: XML_OUTPUT_FILENAME,
          outputMimeType: XML_MIME_TYPE,
        },
        outputEditor: {
          value: "",
          language: XML_LANGUAGE,
          placeholder: XML_OUTPUT_PLACEHOLDER,
        },
      }}
    />
  );
};

export default XmlFormatterPage;
