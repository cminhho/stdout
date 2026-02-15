import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { xmlToJson, jsonToXml } from "@/utils/xmlJson";

const XmlJsonPage = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<"xml2json" | "json2xml">("xml2json");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      if (mode === "xml2json") {
        const obj = xmlToJson(input);
        return { output: JSON.stringify(obj, null, 2), error: "" };
      }
      const parsed = JSON.parse(input);
      return { output: jsonToXml(parsed, "root"), error: "" };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  return (
    <ToolLayout title={tool?.label ?? "XML ↔ JSON"} description={tool?.description ?? "Convert between XML and JSON"}>
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={mode === "xml2json" ? "default" : "outline"} onClick={() => setMode("xml2json")}>XML → JSON</Button>
        <Button size="sm" variant={mode === "json2xml" ? "default" : "outline"} onClick={() => setMode("json2xml")}>JSON → XML</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="tool-panel">
          <PanelHeader label={mode === "xml2json" ? "XML" : "JSON"} text={input} onClear={() => setInput("")} />
          <CodeEditor value={input} onChange={setInput} language={mode === "xml2json" ? "xml" : "json"} placeholder={mode === "xml2json" ? "<root>...</root>" : "{}"} />
        </div>
        <div className="tool-panel">
          <PanelHeader label={mode === "xml2json" ? "JSON" : "XML"} text={output} />
          {error && <div className="text-sm text-destructive mb-2">{error}</div>}
          <CodeEditor value={output} readOnly language={mode === "xml2json" ? "json" : "xml"} placeholder="Result..." />
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlJsonPage;
