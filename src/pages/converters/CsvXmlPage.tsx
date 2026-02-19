import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import { Input } from "@/components/ui/input";
import {
  csvToXml,
  CSV_XML_FILE_ACCEPT,
  CSV_XML_SAMPLE_CSV,
  CSV_XML_PLACEHOLDER_CSV,
  CSV_XML_PLACEHOLDER_OUTPUT,
} from "@/utils/csvXml";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const CsvXmlPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [rootTag, setRootTag] = useState("root");
  const [rowTag, setRowTag] = useState("row");
  const [delimiter, setDelimiter] = useState(",");
  const [indent, setIndent] = useState<IndentOption>(2);

  const { output, error } = useMemo(
    () => {
      if (!input.trim()) return { output: "", error: "" };
      try {
        return { output: csvToXml(input, rootTag, rowTag, delimiter, indent), error: "" };
      } catch (e) {
        return { output: "", error: (e as Error).message };
      }
    },
    [input, rootTag, rowTag, delimiter, indent]
  );

  return (
    <ToolLayout title={tool?.label ?? "CSV → XML"} description={tool?.description ?? "Convert CSV to XML (first row as element names)"}>
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="CSV"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(CSV_XML_SAMPLE_CSV)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={CSV_XML_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="text" placeholder={CSV_XML_PLACEHOLDER_CSV} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XML"
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <IndentSelect value={indent} onChange={setIndent} className={selectClass} />
                <span className="text-xs text-muted-foreground">Root</span>
                <Input value={rootTag} onChange={(e) => setRootTag(e.target.value)} className="h-7 w-24 font-mono rounded border border-input bg-background px-2 text-xs" />
                <span className="text-xs text-muted-foreground">Row</span>
                <Input value={rowTag} onChange={(e) => setRowTag(e.target.value)} className="h-7 w-24 font-mono rounded border border-input bg-background px-2 text-xs" />
                <span className="text-xs text-muted-foreground">Delim</span>
                <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="h-7 w-12 font-mono rounded border border-input bg-background px-2 text-xs text-center" maxLength={1} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder={CSV_XML_PLACEHOLDER_OUTPUT} fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CsvXmlPage;
