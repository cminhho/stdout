import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

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
  const [html, setHtml] = useState('<div class="container">\n  <h1 class="title">Hello World</h1>\n  <p class="text">This is a paragraph.</p>\n</div>');
  const [css, setCss] = useState('.container { padding: 20px; background-color: #f5f5f5; }\n.title { color: #333; font-size: 24px; font-weight: bold; }\n.text { color: #666; font-size: 14px; line-height: 1.6; }');
  const [output, setOutput] = useState("");

  return (
    <ToolLayout title={tool?.label ?? "CSS Inliner (Email)"} description={tool?.description ?? "Inline CSS styles into HTML for email templates"}>
      <div className="tool-toolbar">
        <Button size="sm" onClick={() => setOutput(inlineCss(html, css))}>Inline CSS</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="tool-panel">
          <PanelHeader label="HTML" text={html} onClear={() => { setHtml(""); setOutput(""); }} />
          <CodeEditor value={html} onChange={setHtml} language="html" placeholder='<div class="container">...</div>' />
        </div>
        <div className="tool-panel">
          <PanelHeader label="CSS" text={css} onClear={() => setCss("")} />
          <CodeEditor value={css} onChange={setCss} language="css" placeholder=".class { prop: value; }" />
        </div>
      </div>
      {output && (
        <div className="tool-panel">
          <PanelHeader label="Inlined HTML" text={output} />
          <CodeEditor value={output} readOnly language="html" placeholder="" />
        </div>
      )}
    </ToolLayout>
  );
};

export default CssInlinerPage;
