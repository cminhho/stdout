import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
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

const MODE_OPTIONS: { value: XmlJsonMode; label: string }[] = [
  { value: "xml2json", label: "XML → JSON" },
  { value: "json2xml", label: "JSON → XML" },
];

const XmlJsonPage = () => {
  const [mode, setMode] = useState<XmlJsonMode>("xml2json");
  const [input, setInput] = useState("");

  const setModeWithCleanup = useCallback((next: XmlJsonMode) => {
    setMode(next);
    setInput("");
  }, []);

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
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(sampleInput),
          setInput,
          fileAccept: XML_JSON_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <SegmentGroup<XmlJsonMode>
            value={mode}
            onValueChange={setModeWithCleanup}
            options={MODE_OPTIONS}
            ariaLabel="Conversion direction"
          />
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
