import { useState } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import {
  processXmlToXsd,
  XSD_GENERATOR_FILE_ACCEPT,
  XSD_GENERATOR_SAMPLE_XML,
  XSD_GENERATOR_PLACEHOLDER_INPUT,
  XSD_GENERATOR_PLACEHOLDER_OUTPUT,
  XSD_GENERATOR_OUTPUT_FILENAME,
  XSD_GENERATOR_MIME_TYPE,
} from "@/utils/xsdGenerator";

const XsdGeneratorPage = () => {
  const [input, setInput] = useState("");

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(XSD_GENERATOR_SAMPLE_XML),
          setInput,
          fileAccept: XSD_GENERATOR_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "xml",
          placeholder: XSD_GENERATOR_PLACEHOLDER_INPUT,
        },
      }}
      outputPane={{
        outputToolbar: {
          format: processXmlToXsd,
          outputFilename: XSD_GENERATOR_OUTPUT_FILENAME,
          outputMimeType: XSD_GENERATOR_MIME_TYPE,
        },
        outputEditor: {
          value: "",
          language: "xml",
          placeholder: XSD_GENERATOR_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default XsdGeneratorPage;
