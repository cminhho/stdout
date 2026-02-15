import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

const formatXml = (xml: string, indent = 2): string => {
  const tab = " ".repeat(indent);
  let formatted = "";
  let level = 0;
  const nodes = xml.replace(/>\s*</g, ">\n<").split("\n");
  for (const node of nodes) {
    const trimmed = node.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("</")) { level = Math.max(0, level - 1); formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.startsWith("<?") || trimmed.startsWith("<!")) { formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.endsWith("/>")) { formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.match(/<[^/][^>]*>[^<]*<\/[^>]+>$/)) { formatted += tab.repeat(level) + trimmed + "\n"; }
    else if (trimmed.startsWith("<")) { formatted += tab.repeat(level) + trimmed + "\n"; level++; }
    else { formatted += tab.repeat(level) + trimmed + "\n"; }
  }
  return formatted.trimEnd();
};

const minifyXml = (xml: string): string =>
  xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const XmlFormatterPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState('<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>Advanced XML</title><author>Jane</author><price>39.99</price></book></catalog>');
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);

  return (
    <ToolLayout title={tool?.label ?? "XML Formatter"} description={tool?.description ?? "Format and beautify XML documents"}>
      <div className="tool-toolbar">
        <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="tool-select">
          <option value={2}>2 spaces</option>
          <option value={4}>4 spaces</option>
          <option value={8}>8 spaces</option>
        </select>
        <Button size="sm" onClick={() => setOutput(formatXml(input, indent))}>Format</Button>
        <Button size="sm" variant="outline" onClick={() => setOutput(minifyXml(input))}>Minify</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label="Input XML" text={input} onClear={() => { setInput(""); setOutput(""); }} />
          <CodeEditor value={input} onChange={setInput} language="xml" placeholder='<?xml version="1.0"?>...' />
        </div>
        <div className="tool-panel">
          <PanelHeader label="Output" text={output} />
          <CodeEditor value={output} readOnly language="xml" placeholder="Result will appear here..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlFormatterPage;
