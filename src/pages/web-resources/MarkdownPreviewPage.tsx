import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const defaultMd = `# Markdown Preview

Write your **markdown** here and see it rendered in real-time.

## Features
- GitHub Flavored Markdown
- Tables, strikethrough, task lists
- Code blocks with syntax highlighting
- Export to HTML

\`\`\`javascript
const hello = "world";
console.log(hello);
\`\`\`

| Feature | Status |
|---------|--------|
| GFM     | ✅     |
| Tables  | ✅     |
| Export  | ✅     |

> This is a blockquote

---

- [x] Task completed
- [ ] Task pending
`;

const MarkdownPreviewPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [fileEncoding, setFileEncoding] = useState<FileEncoding>("utf-8");
  const [markdown, setMarkdown] = useState(defaultMd);
  const [showHtml, setShowHtml] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMarkdown(await readFileAsText(file, fileEncoding));
    } catch {
      setMarkdown("");
    }
    e.target.value = "";
  };

  const getHtml = () => {
    const el = document.getElementById("md-preview");
    return el?.innerHTML ?? "";
  };

  return (
    <ToolLayout title={tool?.label ?? "Markdown Preview"} description={tool?.description ?? "Live preview of Markdown with GFM support"}>
      <ToolOptions open={optionsOpen} onOpenChange={setOptionsOpen}>
        <input ref={fileInputRef} type="file" accept=".md,.markdown,text/markdown" className="hidden" onChange={handleFileUpload} />
        <div className="flex flex-col gap-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="Upload your Markdown file">
              <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileInputRef.current?.click()}>
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <OptionField label="View">
              <Button size="sm" variant={showHtml ? "outline" : "default"} onClick={() => setShowHtml(false)} className="h-7 text-xs">
                Preview
              </Button>
              <Button size="sm" variant={showHtml ? "default" : "outline"} onClick={() => setShowHtml(true)} className="h-7 text-xs">
                HTML
              </Button>
            </OptionField>
          </div>
        </div>
      </ToolOptions>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Markdown" text={markdown} onClear={() => setMarkdown("")} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={markdown}
              onChange={setMarkdown}
              language="markdown"
              placeholder="Write markdown here..."
              fillHeight
            />
          </div>
        </div>

        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={showHtml ? "HTML Output" : "Preview"}
            text={showHtml ? getHtml() : markdown}
          />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {showHtml ? (
              <CodeEditor value={getHtml()} readOnly language="html" placeholder="" fillHeight />
            ) : (
              <div
                id="md-preview"
                className="prose-markdown code-block flex-1 min-h-0 overflow-auto rounded-md border border-border p-4 bg-background"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default MarkdownPreviewPage;
