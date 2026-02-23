import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import TwoPanelTopSection from "@/components/TwoPanelTopSection";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
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

  const leftPane = {
    title: "XML & XSLT",
    children: (
      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0 min-h-[120px]">
          <div className="flex items-center justify-between gap-2 shrink-0 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">XML Input</span>
            <div className="flex items-center gap-2 flex-wrap">
              <SampleButton onClick={() => setXml(XSLT_DEFAULT_XML)} />
              <ClearButton onClick={() => setXml("")} />
              <FileUploadButton accept={XSLT_XML_FILE_ACCEPT} onText={setXml} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={xml} onChange={setXml} language="xml" placeholder={XSLT_PLACEHOLDER_XML} fillHeight />
          </div>
        </div>
        <div className="flex flex-col flex-1 min-h-0 min-h-[120px]">
          <div className="flex items-center justify-between gap-2 shrink-0 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">XSLT Stylesheet</span>
            <div className="flex items-center gap-2 flex-wrap">
              <SampleButton onClick={() => setXslt(XSLT_DEFAULT_XSLT)} />
              <ClearButton onClick={() => setXslt("")} />
              <FileUploadButton accept={XSLT_XSLT_FILE_ACCEPT} onText={setXslt} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={xslt} onChange={setXslt} language="xml" placeholder={XSLT_PLACEHOLDER_XSLT} fillHeight />
          </div>
        </div>
      </div>
    ),
  };

  const rightPane = {
    title: "Transformed Output",
    copyText: output,
    toolbar: <IndentSelect value={indent} onChange={setIndent} />,
    children: (
      <div className="flex flex-col flex-1 min-h-0">
        {error && <div className="text-sm text-destructive mb-2 shrink-0">Error: {error}</div>}
        <div className="flex-1 min-h-0 flex flex-col">
          <CodeEditor value={output} readOnly language="xml" placeholder={XSLT_PLACEHOLDER_OUTPUT} fillHeight />
        </div>
      </div>
    ),
  };

  return (
    <ToolLayout title={tool?.label ?? "XSLT Transformer"} description={tool?.description ?? "Transform XML using XSLT stylesheet"}>
      <div className="flex flex-col flex-1 min-h-0 w-full">
        <TwoPanelTopSection formatError={error ? new Error(error) : undefined} />
        <ResizableTwoPanel input={leftPane} output={rightPane} className="flex-1 min-h-0" defaultInputPercent={50} />
      </div>
    </ToolLayout>
  );
};

export default XsltTransformerPage;
