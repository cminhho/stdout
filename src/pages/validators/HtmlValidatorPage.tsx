import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { validateHtml } from "@/utils/validators";

const HtmlValidatorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(`<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><p>Hello</p></body>
</html>`);

  const result = useMemo(() => validateHtml(input), [input]);

  return (
    <ToolLayout title={tool?.label ?? "HTML Validator"} description={tool?.description ?? "Validate HTML syntax (parser-based)"}>
      {input.trim() && (
        <div className={`mb-3 rounded-md border px-3 py-2 text-sm ${result.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/50 bg-destructive/10"}`}>
          {result.valid ? "✓ Valid HTML" : `✗ ${result.error}`}
        </div>
      )}
      <div className="tool-panel">
        <PanelHeader label="HTML Input" text={input} onClear={() => setInput("")} />
        <CodeEditor value={input} onChange={setInput} language="html" placeholder="Paste HTML here..." />
      </div>
    </ToolLayout>
  );
};

export default HtmlValidatorPage;
