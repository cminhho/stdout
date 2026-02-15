import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { xmlToXsd } from "@/core-utils/xsdGenerator";

const sampleXml = `<?xml version="1.0"?>
<catalog>
  <book id="1">
    <title>Alpha</title>
    <year>2020</year>
  </book>
</catalog>`;

const XsdGeneratorPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState(sampleXml);

  const { out, err } = useMemo(() => {
    if (!input.trim()) return { out: "", err: "" };
    try {
      return { out: xmlToXsd(input), err: "" };
    } catch (e) {
      return { out: "", err: (e as Error).message };
    }
  }, [input]);

  const output = out;
  const error = err;

  return (
    <ToolLayout title={tool?.label ?? "XSD Generator"} description={tool?.description ?? "Generate minimal XSD schema from XML"}>
      {error && <div className="text-sm text-destructive mb-2">⚠ {error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="XML Input" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="xml" placeholder="Paste XML..." />
        </div>
        <div className="tool-panel">
          <PanelHeader label="XSD Output" text={output} />
          <CodeEditor value={output} readOnly language="xml" placeholder="Click Generate..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XsdGeneratorPage;
