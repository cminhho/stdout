import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";

type FileEncoding = "utf-8" | "utf-16le" | "utf-16be";

const SAMPLE_HTML = `<div class="container">
  <h1 class="title">Hello World</h1>
  <p class="text">This is a paragraph.</p>
</div>`;

const SAMPLE_CSS = `.container { padding: 20px; background-color: #f5f5f5; }
.title { color: #333; font-size: 24px; font-weight: bold; }
.text { color: #666; font-size: 14px; line-height: 1.6; }`;

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
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [css, setCss] = useState(SAMPLE_CSS);

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

  const htmlExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setHtml(SAMPLE_HTML)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setHtml("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={htmlInputRef} type="file" accept=".html,.htm,text/html" className="hidden" onChange={handleHtmlUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => htmlInputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
      <select
        value={fileEncoding}
        onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
        className={selectClass}
        title="File encoding"
      >
        <option value="utf-8">UTF-8</option>
        <option value="utf-16le">UTF-16 LE</option>
        <option value="utf-16be">UTF-16 BE</option>
      </select>
    </div>
  );

  const cssExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCss(SAMPLE_CSS)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setCss("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input ref={cssInputRef} type="file" accept=".css,text/css" className="hidden" onChange={handleCssUpload} />
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => cssInputRef.current?.click()}>
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
      <select
        value={fileEncoding}
        onChange={(e) => setFileEncoding(e.target.value as FileEncoding)}
        className={selectClass}
        title="File encoding"
      >
        <option value="utf-8">UTF-8</option>
        <option value="utf-16le">UTF-16 LE</option>
        <option value="utf-16be">UTF-16 BE</option>
      </select>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "CSS Inliner (Email)"} description={tool?.description ?? "Inline CSS styles into HTML for email templates"}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="HTML" extra={htmlExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={html} onChange={setHtml} language="html" placeholder='<div class="container">...</div>' fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="CSS" extra={cssExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={css} onChange={setCss} language="css" placeholder=".class { prop: value; }" fillHeight />
          </div>
        </div>
      </div>
      {output ? (
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Inlined HTML" text={output} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="html" placeholder="" fillHeight />
          </div>
        </div>
      ) : null}
    </ToolLayout>
  );
};

export default CssInlinerPage;
