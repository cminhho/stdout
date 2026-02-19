import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { FileCode, Eraser, Upload } from "lucide-react";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") resolve(result);
      else reject(new Error("Failed to read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file, "UTF-8");
  });
};

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const SAMPLE_MARKDOWN = `# Markdown Preview

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
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [showHtml, setShowHtml] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setMarkdown(await readFileAsText(file));
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <input ref={fileInputRef} type="file" accept=".md,.markdown,text/markdown" className="hidden" onChange={handleFileUpload} />
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Markdown"
            extra={
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setMarkdown(SAMPLE_MARKDOWN)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setMarkdown("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 px-2.5 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3 w-3 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
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
            extra={
              <div className="flex items-center gap-2">
                <Button size="sm" variant={showHtml ? "outline" : "default"} onClick={() => setShowHtml(false)} className="h-7 text-xs">
                  Preview
                </Button>
                <Button size="sm" variant={showHtml ? "default" : "outline"} onClick={() => setShowHtml(true)} className="h-7 text-xs">
                  HTML
                </Button>
              </div>
            }
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
