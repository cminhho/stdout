import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
import type { IndentOption } from "@/components/IndentSelect";
import type { XmlJsonMode } from "@/utils/xmlJson";
import {
  processXmlJson,
  XML_JSON_FILE_ACCEPT,
  XML_JSON_SAMPLE_XML,
  XML_JSON_SAMPLE_JSON,
  XML_JSON_PLACEHOLDER_XML,
  XML_JSON_PLACEHOLDER_JSON,
  XML_JSON_PLACEHOLDER_OUTPUT,
  XML_JSON_OUTPUT_FILENAME_JSON,
  XML_JSON_OUTPUT_FILENAME_XML,
  XML_JSON_MIME_JSON,
  XML_JSON_MIME_XML,
} from "@/utils/xmlJson";

const XmlJsonPage = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<XmlJsonMode>("xml2json");
  const [input, setInput] = useState("");

  const format = useCallback(
    (inputValue: string, indent: IndentOption) => processXmlJson(inputValue, indent, mode),
    [mode]
  );

  const sampleInput = mode === "xml2json" ? XML_JSON_SAMPLE_XML : XML_JSON_SAMPLE_JSON;
  const inputPlaceholder = mode === "xml2json" ? XML_JSON_PLACEHOLDER_XML : XML_JSON_PLACEHOLDER_JSON;
  const inputLang = mode === "xml2json" ? "xml" : "json";
  const outputLang = mode === "xml2json" ? "json" : "xml";

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        toolbar: (
          <>
            <Button size="sm" variant={mode === "xml2json" ? "default" : "outline"} onClick={() => setMode("xml2json")} className="h-7 text-xs">
              XML → JSON
            </Button>
            <Button size="sm" variant={mode === "json2xml" ? "default" : "outline"} onClick={() => setMode("json2xml")} className="h-7 text-xs">
              JSON → XML
            </Button>
            <SampleButton onClick={() => setInput(sampleInput)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={XML_JSON_FILE_ACCEPT} onText={setInput} />
          </>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: inputLang,
          placeholder: inputPlaceholder,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: mode === "xml2json" ? XML_JSON_OUTPUT_FILENAME_JSON : XML_JSON_OUTPUT_FILENAME_XML,
          outputMimeType: mode === "xml2json" ? XML_JSON_MIME_JSON : XML_JSON_MIME_XML,
        },
        outputEditor: {
          value: "",
          language: outputLang,
          placeholder: XML_JSON_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default XmlJsonPage;
