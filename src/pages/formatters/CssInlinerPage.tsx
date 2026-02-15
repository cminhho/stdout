import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { ToolOptions, OptionField } from "@/components/ToolOptions";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const readFileAsText = (file: File, encoding: FileEncoding): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
        return;
      }
      if (result instanceof ArrayBuffer) {
        const enc = encoding === "utf-16le" ? "utf-16le" : encoding === "utf-16be" ? "utf-16be" : "utf-8";
        resolve(new TextDecoder(enc).decode(result));
        return;
      }
      reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    if (encoding === "utf-8") {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

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

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const CssInlinerPage = () => {
  const tool = useCurrentTool();
  const htmlInputRef = useRef<HTMLInputElement>(null);
  const cssInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [html, setHtml] = useState('<div class="container">\n  <h1 class="title">Hello World</h1>\n  <p class="text">This is a paragraph.</p>\n</div>');
  const [css, setCss] = useState('.container { padding: 20px; background-color: #f5f5f5; }\n.title { color: #333; font-size: 24px; font-weight: bold; }\n.text { color: #666; font-size: 14px; line-height: 1.6; }');

  const output = useMemo(() => (html.trim() && css.trim() ? inlineCss(html, css) : ""), [html, css]);

  const handleHtmlUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setHtml(await readFileAsText(file, fileEncoding));
    } catch {
      setHtml("");
    }
    e.target.value = "";
  };

  const handleCssUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCss(await readFileAsText(file, fileEncoding));
    } catch {
      setCss("");
    }
    e.target.value = "";
  };

  return (
    <ToolLayout title={tool?.label ?? "CSS Inliner (Email)"} description={tool?.description ?? "Inline CSS styles into HTML for email templates"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={htmlInputRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleHtmlUpload} />
        <input ref={cssInputRef} type="file" accept=".css,text/css" className="hidden" onChange={handleCssUpload} />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload your HTML file">
              <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => htmlInputRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1.5" />
                Upload file
              </Button>
            </OptionField>
            <OptionField label="Upload your CSS file">
              <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => cssInputRef.current?.click()}>
                <Upload className="h-3 w-3 mr-1.5" />
                Upload file
              </Button>
            </OptionField>
            <OptionField label="File encoding">
              <select value={fileEncoding} onChange={(e) => setFileEncoding(e.target.value as FileEncoding)} className={selectClass}>
                <option value="utf-8">UTF-8</option>
                <option value="utf-16le">UTF-16 LE</option>
                <option value="utf-16be">UTF-16 BE</option>
              </select>
            </OptionField>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="tool-panel">
          <PanelHeader label="HTML" text={html} onClear={() => setHtml("")} />
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
