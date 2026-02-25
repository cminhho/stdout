import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import ResizableTwoPanel from "@/components/ResizableTwoPanel";
import ToolPane, { type PaneProps } from "@/components/ToolPane";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import { SaveButton } from "@/components/SaveButton";
import ToolLayout from "@/components/ToolLayout";
import {
  CSS_INLINER_CSS_ACCEPT,
  CSS_INLINER_CSS_PLACEHOLDER,
  CSS_INLINER_CSS_SAMPLE,
  CSS_INLINER_HTML_ACCEPT,
  CSS_INLINER_HTML_PLACEHOLDER,
  CSS_INLINER_HTML_SAMPLE,
  CSS_INLINER_OUTPUT_FILENAME,
  CSS_INLINER_OUTPUT_MIME_TYPE,
  inlineCss,
} from "@/utils/cssInliner";

const CssInlinerPage = () => {
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

  const output = useMemo(
    () => (html.trim() && css.trim() ? inlineCss(html, css) : ""),
    [html, css]
  );

  const htmlPane: PaneProps = {
    title: "HTML",
    toolbar: (
      <>
        <SampleButton onClick={() => setHtml(CSS_INLINER_HTML_SAMPLE)} />
        <ClearButton onClick={() => setHtml("")} />
        <FileUploadButton accept={CSS_INLINER_HTML_ACCEPT} onText={setHtml} />
      </>
    ),
    children: (
      <CodeEditor
        value={html}
        onChange={setHtml}
        language="html"
        placeholder={CSS_INLINER_HTML_PLACEHOLDER}
        fillHeight
      />
    ),
  };

  const cssPane: PaneProps = {
    title: "CSS",
    toolbar: (
      <>
        <SampleButton onClick={() => setCss(CSS_INLINER_CSS_SAMPLE)} />
        <ClearButton onClick={() => setCss("")} />
        <FileUploadButton accept={CSS_INLINER_CSS_ACCEPT} onText={setCss} />
      </>
    ),
    children: (
      <CodeEditor
        value={css}
        onChange={setCss}
        language="css"
        placeholder={CSS_INLINER_CSS_PLACEHOLDER}
        fillHeight
      />
    ),
  };

  const outputPane: PaneProps = {
    title: "Inlined HTML",
    copyText: output,
    toolbar: (
      <SaveButton
        content={output}
        filename={CSS_INLINER_OUTPUT_FILENAME}
        mimeType={CSS_INLINER_OUTPUT_MIME_TYPE}
      />
    ),
    children: (
      <CodeEditor value={output} readOnly language="html" placeholder="" fillHeight />
    ),
  };

  return (
    <ToolLayout>
      <ResizableTwoPanel
        input={htmlPane}
        output={cssPane}
        defaultInputPercent={50}
        className="tool-layout-section"
      />
      {output ? (
        <div className="tool-layout-section flex-1 min-h-0 flex flex-col">
          <ToolPane pane={outputPane} />
        </div>
      ) : null}
    </ToolLayout>
  );
};

export default CssInlinerPage;
