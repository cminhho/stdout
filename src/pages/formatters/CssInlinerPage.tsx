import { useState, useMemo } from "react";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import PanelHeader from "@/components/PanelHeader";
import { ClearButton, SampleButton, SaveButton } from "@/components/ToolActionButtons";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";

const SAMPLE_HTML = `<div class="container">
  <h1 class="title">Hello World</h1>
  <p class="text">This is a paragraph.</p>
</div>`;

const SAMPLE_CSS = `.container { padding: 20px; background-color: #f5f5f5; }
.title { color: #333; font-size: 24px; font-weight: bold; }
.text { color: #666; font-size: 14px; line-height: 1.6; }`;

const inlineCss = (html: string, css: string): string => {
  const rules: { selector: string; props: string }[] = [];
  const ruleRegex = /([^{]+)\{([^}]+)\}/g;
  let match;
  while ((match = ruleRegex.exec(css)) !== null) {
    rules.push({ selector: match[1].trim(), props: match[2].trim() });
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  for (const rule of rules) {
    try {
      const els = doc.querySelectorAll(rule.selector);
      els.forEach((el) => {
        const existing = el.getAttribute("style") || "";
        el.setAttribute("style", existing ? `${existing}; ${rule.props}` : rule.props);
      });
    } catch {
      // Invalid selector, skip
    }
  }

  return doc.body.innerHTML;
};

const CssInlinerPage = () => {
  const tool = useCurrentTool();
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [css, setCss] = useState(SAMPLE_CSS);

  const output = useMemo(() => (html.trim() && css.trim() ? inlineCss(html, css) : ""), [html, css]);

  return (
    <ToolLayout title={tool?.label ?? "CSS Inliner (Email)"} description={tool?.description ?? "Inline CSS styles into HTML for email templates"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="HTML"
            extra={
              <>
                <SampleButton onClick={() => setHtml(SAMPLE_HTML)} />
                <ClearButton onClick={() => setHtml("")} />
                <FileUploadButton accept=".html,.htm,text/html" onText={setHtml} />
              </>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={html} onChange={setHtml} language="html" placeholder='<div class="container">...</div>' fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="CSS"
            extra={
              <>
                <SampleButton onClick={() => setCss(SAMPLE_CSS)} />
                <ClearButton onClick={() => setCss("")} />
                <FileUploadButton accept=".css,text/css" onText={setCss} />
              </>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={css} onChange={setCss} language="css" placeholder=".class { prop: value; }" fillHeight />
          </div>
        </div>
      </div>
      {output ? (
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Inlined HTML"
            text={output}
            extra={<SaveButton content={output} filename="inlined.html" mimeType="text/html" />}
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
