import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OptionsButton from "@/components/OptionsButton";
import type { IndentOption } from "@/components/IndentSelect";
import {
  processCsvToXmlForLayout,
  CSV_XML_FILE_ACCEPT,
  CSV_XML_SAMPLE_CSV,
  CSV_XML_PLACEHOLDER_CSV,
  CSV_XML_PLACEHOLDER_OUTPUT,
  CSV_XML_OUTPUT_FILENAME,
  CSV_XML_MIME_TYPE,
} from "@/utils/csvXml";

const CsvXmlPage = () => {
  const [input, setInput] = useState("");
  const [rootTag, setRootTag] = useState("root");
  const [rowTag, setRowTag] = useState("row");
  const [delimiter, setDelimiter] = useState(",");

  const format = useCallback(
    (inputValue: string, indent: IndentOption) =>
      processCsvToXmlForLayout(inputValue, indent, rootTag, rowTag, delimiter),
    [rootTag, rowTag, delimiter]
  );

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(CSV_XML_SAMPLE_CSV),
          setInput,
          fileAccept: CSV_XML_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <OptionsButton ariaLabel="CSV to XML options">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label variant="muted" className="text-xs">Root tag</Label>
                <Input
                  value={rootTag}
                  onChange={(e) => setRootTag(e.target.value)}
                  className="h-7 font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label variant="muted" className="text-xs">Row tag</Label>
                <Input
                  value={rowTag}
                  onChange={(e) => setRowTag(e.target.value)}
                  className="h-7 font-mono text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label variant="muted" className="text-xs">Delimiter</Label>
                <Input
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="h-7 w-12 font-mono text-xs text-center"
                  maxLength={1}
                />
              </div>
            </div>
          </OptionsButton>
        ),
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: CSV_XML_PLACEHOLDER_CSV,
        },
      }}
      outputPane={{
        outputToolbar: {
          format,
          outputFilename: CSV_XML_OUTPUT_FILENAME,
          outputMimeType: CSV_XML_MIME_TYPE,
          defaultIndent: 2,
          indentSpaceOptions: [2, 4],
          indentIncludeTab: false,
        },
        outputEditor: {
          value: "",
          language: "xml",
          placeholder: CSV_XML_PLACEHOLDER_OUTPUT,
        },
      }}
    />
  );
};

export default CsvXmlPage;
