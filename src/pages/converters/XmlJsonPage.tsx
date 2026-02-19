import { useState, useRef, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Eraser } from "lucide-react";
import { xmlToJson, jsonToXml } from "@/utils/xmlJson";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";

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

const SAMPLE_XML = "<root><item id=\"1\">Alpha</item><item id=\"2\">Beta</item></root>";
const SAMPLE_JSON = "{\"root\":{\"item\":[{\"@id\":\"1\",\"#text\":\"Alpha\"},{\"@id\":\"2\",\"#text\":\"Beta\"}]}}";

const XmlJsonPage = () => {
  const tool = useCurrentTool();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"xml2json" | "json2xml">("xml2json");
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setInput(await readFileAsText(file));
    } catch {
      setInput("");
    }
    e.target.value = "";
  };

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "xml2json") {
        const obj = xmlToJson(input);
        const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
        return { output: JSON.stringify(obj, null, space), error: "" };
      }
      const parsed = JSON.parse(input);
      return { output: jsonToXml(parsed, "root"), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, indent]);

  const sampleInput = mode === "xml2json" ? SAMPLE_XML : SAMPLE_JSON;

  return (
    <ToolLayout title={tool?.label ?? "XML ↔ JSON"} description={tool?.description ?? "Convert between XML and JSON"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <Button size="sm" variant={mode === "xml2json" ? "default" : "outline"} onClick={() => setMode("xml2json")} className="h-7 text-xs">XML → JSON</Button>
        <Button size="sm" variant={mode === "json2xml" ? "default" : "outline"} onClick={() => setMode("json2xml")} className="h-7 text-xs">JSON → XML</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "xml2json" ? "XML" : "JSON"}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(sampleInput)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
                <input ref={fileInputRef} type="file" accept=".xml,.json,application/xml,application/json" className="hidden" onChange={handleFileUpload} />
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language={mode === "xml2json" ? "xml" : "json"} placeholder={mode === "xml2json" ? "<root>...</root>" : "{}"} fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "xml2json" ? "JSON" : "XML"}
            text={output}
            extra={mode === "xml2json" ? <IndentSelect value={indent} onChange={setIndent} className={selectClass} /> : undefined}
          />
          {error && <div className="text-sm text-destructive mb-2 shrink-0">{error}</div>}
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={output} readOnly language={mode === "xml2json" ? "json" : "xml"} placeholder="Result..." fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlJsonPage;
