import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { validateXml } from "@/core-utils/validators";

const XmlValidatorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(`<?xml version="1.0"?>
<root>
  <item id="1">Hello</item>
</root>`);

  const result = useMemo(() => validateXml(input), [input]);

  return (
    <ToolLayout title={tool?.label ?? "XML Validator"} description={tool?.description ?? "Validate XML syntax and structure"}>
      {input.trim() && (
        <div className={`mb-3 rounded-md border px-3 py-2 text-sm ${result.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/50 bg-destructive/10"}`}>
          {result.valid ? "✓ Valid XML" : `✗ ${result.error}`}
        </div>
      )}
      <div className="tool-panel">
        <PanelHeader label="XML Input" text={input} onClear={() => setInput("")} />
        <CodeEditor value={input} onChange={setInput} language="xml" placeholder="Paste XML here..." />
      </div>
    </ToolLayout>
  );
};

export default XmlValidatorPage;
