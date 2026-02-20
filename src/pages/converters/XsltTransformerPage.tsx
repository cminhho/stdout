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
  transformWithXslt,
  XSLT_XML_FILE_ACCEPT,
  XSLT_XSLT_FILE_ACCEPT,
  XSLT_DEFAULT_XML,
  XSLT_DEFAULT_XSLT,
  XSLT_PLACEHOLDER_XML,
  XSLT_PLACEHOLDER_XSLT,
  XSLT_PLACEHOLDER_OUTPUT,
} from "@/utils/xsltTransformer";

const XsltTransformerPage = () => {
  const tool = useCurrentTool();
  const [xml, setXml] = useState("");
  const [xslt, setXslt] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const { output, error } = useMemo(() => {
    if (!xml.trim() || !xslt.trim()) return { output: "", error: "" };
    try {
      let out = transformWithXslt(xml, xslt);
      if (out.trim().startsWith("<")) {
        if (indent === "minified") out = minifyXml(out);
        else {
          const indentNum = indent === "tab" ? 2 : (indent as number);
          out = formatXml(out, indentNum, indent === "tab");
        }
      }
      return { output: out, error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [xml, xslt, indent]);

  return (
    <ToolLayout title={tool?.label ?? "XSLT Transformer"} description={tool?.description ?? "Transform XML using XSLT stylesheet"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XML Input"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setXml(XSLT_DEFAULT_XML)} />
                <ClearButton onClick={() => setXml("")} />
                <FileUploadButton accept={XSLT_XML_FILE_ACCEPT} onText={setXml} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={xml} onChange={setXml} language="xml" placeholder={XSLT_PLACEHOLDER_XML} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="XSLT Stylesheet"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setXslt(XSLT_DEFAULT_XSLT)} />
                <ClearButton onClick={() => setXslt("")} />
                <FileUploadButton accept={XSLT_XSLT_FILE_ACCEPT} onText={setXslt} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={xslt} onChange={setXslt} language="xml" placeholder={XSLT_PLACEHOLDER_XSLT} fillHeight />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col min-h-0 flex-1">
        {error && <div className="text-sm text-destructive mb-2 shrink-0">Error: {error}</div>}
        <div className="tool-panel flex flex-col min-h-0 flex-1">
          <PanelHeader label="Transformed Output" text={output} extra={<IndentSelect value={indent} onChange={setIndent} />} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder={XSLT_PLACEHOLDER_OUTPUT} fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsltTransformerPage;
