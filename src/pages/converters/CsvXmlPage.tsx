import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import OptionsButton from "@/components/common/OptionsButton";
import type { IndentOption } from "@/components/common/IndentSelect";
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
        title: "CSV",
        inputToolbar: {
          onSample: () => setInput(CSV_XML_SAMPLE_CSV),
          setInput,
          fileAccept: CSV_XML_FILE_ACCEPT,
          onFileText: setInput,
        },
        inputToolbarExtra: (
          <OptionsButton ariaLabel="CSV to XML options">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="csv-xml-root-tag" className="tool-field-label">
                  Root tag
                </Label>
                <Input
                  id="csv-xml-root-tag"
                  value={rootTag}
                  onChange={(e) => setRootTag(e.target.value)}
                  className="h-9 font-mono text-[length:var(--text-ui)] rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="XML root element name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="csv-xml-row-tag" className="tool-field-label">
                  Row tag
                </Label>
                <Input
                  id="csv-xml-row-tag"
                  value={rowTag}
                  onChange={(e) => setRowTag(e.target.value)}
                  className="h-9 font-mono text-[length:var(--text-ui)] rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="XML row element name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="csv-xml-delimiter" className="tool-field-label">
                  Delimiter
                </Label>
                <Input
                  id="csv-xml-delimiter"
                  value={delimiter}
                  onChange={(e) => setDelimiter(e.target.value)}
                  className="h-9 w-12 font-mono text-[length:var(--text-ui)] text-center rounded-[var(--radius-button)] transition-colors duration-150"
                  maxLength={1}
                  aria-label="CSV field delimiter"
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
        title: "XML",
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
