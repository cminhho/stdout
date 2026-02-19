import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import { formatXml, minifyXml } from "@/utils/xmlFormat";
import {
  xmlToXsd,
  XSD_GENERATOR_FILE_ACCEPT,
  XSD_GENERATOR_SAMPLE_XML,
  XSD_GENERATOR_PLACEHOLDER_INPUT,
  XSD_GENERATOR_PLACEHOLDER_OUTPUT,
} from "@/utils/xsdGenerator";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const XsdGeneratorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const raw = xmlToXsd(input);
      if (indent === "minified") return { output: minifyXml(raw), error: "" };
      const indentNum = indent === "tab" ? 2 : (indent as number);
      return { output: formatXml(raw, indentNum, indent === "tab"), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, indent]);

  return (
    <ToolLayout title={tool?.label ?? "XSD Generator"} description={tool?.description ?? "Generate minimal XSD schema from XML"}>
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XML Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(XSD_GENERATOR_SAMPLE_XML)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={XSD_GENERATOR_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="xml" placeholder={XSD_GENERATOR_PLACEHOLDER_INPUT} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="XSD Output" text={output} extra={<IndentSelect value={indent} onChange={setIndent} className={selectClass} />} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder={XSD_GENERATOR_PLACEHOLDER_OUTPUT} fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsdGeneratorPage;
