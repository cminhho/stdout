import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import FileUploadButton from "@/components/FileUploadButton";
import { Input } from "@/components/ui/input";
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

const inputClass = "h-7 font-mono rounded border border-input bg-background px-2 text-xs";

const CsvXmlPage = () => {
  const tool = useCurrentTool();
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
      tool={tool}
      inputPane={{
        onClear: () => setInput(""),
        toolbar: (
          <>
            <SampleButton onClick={() => setInput(CSV_XML_SAMPLE_CSV)} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept={CSV_XML_FILE_ACCEPT} onText={setInput} />
            <span className="text-xs text-muted-foreground">Root</span>
            <Input value={rootTag} onChange={(e) => setRootTag(e.target.value)} className={`${inputClass} w-24`} />
            <span className="text-xs text-muted-foreground">Row</span>
            <Input value={rowTag} onChange={(e) => setRowTag(e.target.value)} className={`${inputClass} w-24`} />
            <span className="text-xs text-muted-foreground">Delim</span>
            <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className={`${inputClass} w-12 text-center`} maxLength={1} />
          </>
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
