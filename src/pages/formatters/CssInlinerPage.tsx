import { useMemo, useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import PanelHeader from "@/components/PanelHeader";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import { SaveButton } from "@/components/SaveButton";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
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
  const tool = useCurrentTool();
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");

  const output = useMemo(
    () => (html.trim() && css.trim() ? inlineCss(html, css) : ""),
    [html, css]
  );

  return (
    <ToolLayout
      title={tool?.label ?? "CSS Inliner (Email)"}
      description={tool?.description ?? "Inline CSS styles into HTML for email templates"}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid tool-layout-section">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="HTML"
            extra={
              <>
                <SampleButton onClick={() => setHtml(CSS_INLINER_HTML_SAMPLE)} />
                <ClearButton onClick={() => setHtml("")} />
                <FileUploadButton accept={CSS_INLINER_HTML_ACCEPT} onText={setHtml} />
              </>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={html}
              onChange={setHtml}
              language="html"
              placeholder={CSS_INLINER_HTML_PLACEHOLDER}
              fillHeight
            />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="CSS"
            extra={
              <>
                <SampleButton onClick={() => setCss(CSS_INLINER_CSS_SAMPLE)} />
                <ClearButton onClick={() => setCss("")} />
                <FileUploadButton accept={CSS_INLINER_CSS_ACCEPT} onText={setCss} />
              </>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={css}
              onChange={setCss}
              language="css"
              placeholder={CSS_INLINER_CSS_PLACEHOLDER}
              fillHeight
            />
          </div>
        </div>
      </div>
      {output ? (
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Inlined HTML"
            text={output}
            extra={
              <SaveButton
                content={output}
                filename={CSS_INLINER_OUTPUT_FILENAME}
                mimeType={CSS_INLINER_OUTPUT_MIME_TYPE}
              />
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="html" placeholder="" fillHeight />
          </div>
        </div>
      ) : null}
    </ToolLayout>
  );
};

export default CssInlinerPage;
