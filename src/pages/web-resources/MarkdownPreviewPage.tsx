import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import CodeEditor from "@/components/common/CodeEditor";
import { Button } from "@/components/ui/button";
import { htmlBeautify } from "@/utils/beautifier";

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

const getHtml = () => document.getElementById("md-preview")?.innerHTML ?? "";

const MarkdownPreviewPage = () => {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [showHtml, setShowHtml] = useState(false);
  const [beautifiedHtml, setBeautifiedHtml] = useState("");

  useEffect(() => {
    if (!showHtml) return;
    const raw = getHtml();
    if (!raw.trim()) {
      setBeautifiedHtml("");
      return;
    }
    let cancelled = false;
    htmlBeautify(raw, 2, false)
      .then((out) => {
        if (!cancelled) setBeautifiedHtml(out);
      })
      .catch(() => {
        if (!cancelled) setBeautifiedHtml(raw);
      });
    return () => {
      cancelled = true;
    };
  }, [showHtml, markdown]);

  return (
    <TwoPanelToolLayout
      inputPane={{
        inputToolbar: {
          onSample: () => setMarkdown(SAMPLE_MARKDOWN),
          setInput: setMarkdown,
          fileAccept: ".md,.markdown,text/markdown",
          onFileText: setMarkdown,
        },
        inputEditor: {
          value: markdown,
          onChange: setMarkdown,
          language: "markdown",
          placeholder: "Write markdown here...",
        },
      }}
      outputPane={{
        title: showHtml ? "HTML Output" : "Preview",
        copyText: showHtml ? (beautifiedHtml || getHtml()) : markdown,
        toolbar: (
          <>
            <Button
              size="xs"
              variant={showHtml ? "outline" : "default"}
              onClick={() => setShowHtml(false)}
            >
              Preview
            </Button>
            <Button
              size="xs"
              variant={showHtml ? "default" : "outline"}
              onClick={() => setShowHtml(true)}
            >
              HTML
            </Button>
          </>
        ),
        children: (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <div
              id="md-preview"
              className={`prose-markdown code-block flex-1 min-h-0 overflow-auto rounded-md border border-border bg-background ${showHtml ? "hidden" : ""}`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
            </div>
            {showHtml && (
              <CodeEditor
                value={beautifiedHtml || getHtml()}
                readOnly
                language="html"
                placeholder=""
                fillHeight
              />
            )}
          </div>
        ),
      }}
    />
  );
};

export default MarkdownPreviewPage;
