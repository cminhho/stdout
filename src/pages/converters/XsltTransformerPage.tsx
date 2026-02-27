import { useState, useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ResizableTwoPanel from "@/components/layout/ResizableTwoPanel";
import TwoPanelTopSection from "@/components/layout/TwoPanelTopSection";
import CodeEditor from "@/components/common/CodeEditor";
import FileUploadButton from "@/components/common/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/common/IndentSelect";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";
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
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-hidden">
        <section className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden min-h-[120px]" aria-label="XML Input">
          <div className="shrink-0 flex items-center justify-between gap-2 px-[var(--spacing-panel-inner-x)] pt-[var(--spacing-panel-inner-y)] pb-2">
            <h2 className="home-section-label mb-0">XML Input</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <SampleButton onClick={() => setXml(XSLT_DEFAULT_XML)} />
              <ClearButton onClick={() => setXml("")} />
              <FileUploadButton accept={XSLT_XML_FILE_ACCEPT} onText={setXml} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col border-t border-border">
            <CodeEditor value={xml} onChange={setXml} language="xml" placeholder={XSLT_PLACEHOLDER_XML} fillHeight />
          </div>
        </section>
        <section className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden min-h-[120px]" aria-label="XSLT Stylesheet">
          <div className="shrink-0 flex items-center justify-between gap-2 px-[var(--spacing-panel-inner-x)] pt-[var(--spacing-panel-inner-y)] pb-2">
            <h2 className="home-section-label mb-0">XSLT Stylesheet</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <SampleButton onClick={() => setXslt(XSLT_DEFAULT_XSLT)} />
              <ClearButton onClick={() => setXslt("")} />
              <FileUploadButton accept={XSLT_XSLT_FILE_ACCEPT} onText={setXslt} />
            </div>
          </div>
          <div className="flex-1 min-h-0 flex flex-col border-t border-border">
            <CodeEditor value={xslt} onChange={setXslt} language="xml" placeholder={XSLT_PLACEHOLDER_XSLT} fillHeight />
          </div>
        </section>
      </div>
    ),
  };

  const rightPane = {
    title: "Transformed Output",
    copyText: output,
    toolbar: (
      <div className="toolbar-actions-row">
        <IndentSelect value={indent} onChange={setIndent} />
      </div>
    ),
    children: (
      <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-hidden">
        {error && (
          <div className="text-[length:var(--text-ui)] text-destructive shrink-0" role="alert">
            Error: {error}
          </div>
        )}
        <section className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden" aria-label="Output">
          <CodeEditor value={output} readOnly language="xml" placeholder={XSLT_PLACEHOLDER_OUTPUT} fillHeight />
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-[var(--home-content-gap)]">
        <TwoPanelTopSection formatError={error ? new Error(error) : undefined} />
        <ResizableTwoPanel input={leftPane} output={rightPane} className="flex-1 min-h-0" defaultInputPercent={50} />
      </div>
    </ToolLayout>
  );
};

export default XsltTransformerPage;
