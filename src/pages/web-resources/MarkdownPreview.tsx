import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

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

const MarkdownPreview = () => {
  const tool = useCurrentTool();
  const [markdown, setMarkdown] = useState(defaultMd);
  const [showHtml, setShowHtml] = useState(false);

  const getHtml = () => {
    const el = document.getElementById("md-preview");
    return el?.innerHTML ?? "";
  };

  return (
    <ToolLayout title={tool?.label ?? "Markdown Preview"} description={tool?.description ?? "Live preview of Markdown with GFM support"}>
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
            extra={
              <Button size="sm" variant="outline" onClick={() => setShowHtml(!showHtml)} className="h-7 text-xs">
                {showHtml ? "Preview" : "HTML"}
              </Button>
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

export default MarkdownPreview;
