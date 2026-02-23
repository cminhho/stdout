import { type ReactNode, useMemo, useState } from "react";
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

const DEFAULT_TITLE = "CSS Inliner (Email)";
const DEFAULT_DESCRIPTION = "Inline CSS styles into HTML for email templates";

/**
 * Single editor pane: header (--spacing-panel-inner-x/y) + body; vertical gap
 * --spacing-panel-gap. Body uses flex-1 min-h-0 so CodeEditor fills (VS Code panel).
 */
function EditorPanel({
  label,
  text,
  extra,
  children,
}: {
  label: string;
  text?: string;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="tool-panel">
      <PanelHeader label={label} text={text} extra={extra} />
      <div className="flex-1 min-h-0 flex flex-col">{children}</div>
    </div>
  );
}

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
      title={tool?.label ?? DEFAULT_TITLE}
      description={tool?.description ?? DEFAULT_DESCRIPTION}
    >
      {/* Grid: --spacing-grid-gap between columns/rows; --spacing-section-mb below (VS Code 8px base). */}
      <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid tool-layout-section flex-1 min-h-0">
        <EditorPanel
          label="HTML"
          extra={
            <>
              <SampleButton onClick={() => setHtml(CSS_INLINER_HTML_SAMPLE)} />
              <ClearButton onClick={() => setHtml("")} />
              <FileUploadButton accept={CSS_INLINER_HTML_ACCEPT} onText={setHtml} />
            </>
          }
        >
          <CodeEditor
            value={html}
            onChange={setHtml}
            language="html"
            placeholder={CSS_INLINER_HTML_PLACEHOLDER}
            fillHeight
          />
        </EditorPanel>
        <EditorPanel
          label="CSS"
          extra={
            <>
              <SampleButton onClick={() => setCss(CSS_INLINER_CSS_SAMPLE)} />
              <ClearButton onClick={() => setCss("")} />
              <FileUploadButton accept={CSS_INLINER_CSS_ACCEPT} onText={setCss} />
            </>
          }
        >
          <CodeEditor
            value={css}
            onChange={setCss}
            language="css"
            placeholder={CSS_INLINER_CSS_PLACEHOLDER}
            fillHeight
          />
        </EditorPanel>
      </div>
      {/* Output section: same --spacing-section-mb; flex-1 so it shares height with grid (VS Code split). */}
      {output ? (
        <div className="tool-layout-section flex-1 min-h-0 flex flex-col">
          <EditorPanel
            label="Inlined HTML"
            text={output}
            extra={
              <SaveButton
                content={output}
                filename={CSS_INLINER_OUTPUT_FILENAME}
                mimeType={CSS_INLINER_OUTPUT_MIME_TYPE}
              />
            }
          >
            <CodeEditor value={output} readOnly language="html" placeholder="" fillHeight />
          </EditorPanel>
        </div>
      ) : null}
    </ToolLayout>
  );
};

export default CssInlinerPage;
