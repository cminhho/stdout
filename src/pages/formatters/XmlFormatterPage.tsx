import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import { validateXml } from "@/utils/validators";

type IndentOption = "2" | "4" | "tab" | "minified";

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="1">
    <title>XML Guide</title>
    <author>John Doe</author>
    <price>29.99</price>
  </book>
  <book id="2">
    <title>Advanced XML</title>
    <author>Jane Smith</author>
    <price>39.99</price>
  </book>
</catalog>`;

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

const formatXml = (xml: string, indent = 2, useTabs = false): string => {
  const indentStr = useTabs ? "\t" : " ".repeat(indent);
  let formatted = "";
  let level = 0;
  const nodes = xml.replace(/>\s*</g, ">\n<").split("\n");
  for (const node of nodes) {
    const trimmed = node.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("</")) { level = Math.max(0, level - 1); formatted += indentStr.repeat(level) + trimmed + "\n"; }
    else if (trimmed.startsWith("<?") || trimmed.startsWith("<!")) { formatted += indentStr.repeat(level) + trimmed + "\n"; }
    else if (trimmed.endsWith("/>")) { formatted += indentStr.repeat(level) + trimmed + "\n"; }
    else if (trimmed.match(/<[^/][^>]*>[^<]*<\/[^>]+>$/)) { formatted += indentStr.repeat(level) + trimmed + "\n"; }
    else if (trimmed.startsWith("<")) { formatted += indentStr.repeat(level) + trimmed + "\n"; level++; }
    else { formatted += indentStr.repeat(level) + trimmed + "\n"; }
  }
  return formatted.trimEnd();
};

const minifyXml = (xml: string): string =>
  xml.replace(/>\s+</g, "><").replace(/\s+/g, " ").trim();

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const XmlFormatterPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('<?xml version="1.0"?><catalog><book id="1"><title>XML Guide</title><author>John</author><price>29.99</price></book><book id="2"><title>Advanced XML</title><author>Jane</author><price>39.99</price></book></catalog>');
  const [indentOption, setIndentOption] = useState<IndentOption>("2");

  const validation = useMemo(() => validateXml(input), [input]);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    if (indentOption === "minified") return minifyXml(input);
    const indentNum = indentOption === "tab" ? 2 : Number(indentOption);
    const useTabs = indentOption === "tab";
    return formatXml(input, indentNum, useTabs);
  }, [input, indentOption]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      setInput(text);
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const inputExtra = (
    <div className="flex items-center gap-2 flex-wrap">
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_XML)}>
        <FileCode className="h-3.5 w-3.5 mr-1.5" />
        Sample
      </Button>
      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
        <Eraser className="h-3.5 w-3.5 mr-1.5" />
        Clear
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xml,application/xml,text/xml"
        className="hidden"
        onChange={handleFileUpload}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-3.5 w-3.5 mr-1.5" />
        Upload
      </Button>
    </div>
  );

  const outputExtra = (
    <div className="flex items-center gap-2">
      <select
        value={indentOption}
        onChange={(e) => setIndentOption(e.target.value as IndentOption)}
        className={selectClass}
        title="Indentation"
      >
        <option value="2">2 spaces</option>
        <option value="4">4 spaces</option>
        <option value="tab">1 tab</option>
        <option value="minified">Minified</option>
      </select>
    </div>
  );

  return (
    <ToolLayout title={tool?.label ?? "XML Format/Validate"} description={tool?.description ?? "Beautify, minify & validate XML"}>
      {input.trim() && (
        <div
          className={`mb-3 rounded-md border px-3 py-2 text-sm ${validation.valid ? "border-green-500/30 bg-green-500/5" : "border-destructive/50 bg-destructive/10"}`}
        >
          {validation.valid ? "✓ Valid XML" : `✗ ${validation.error}`}
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Input XML" extra={inputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="xml" placeholder='<?xml version="1.0"?>...' fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Output" text={output} extra={outputExtra} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language="xml" placeholder="Result will appear here..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlFormatterPage;
