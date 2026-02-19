import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import FileUploadButton from "@/components/FileUploadButton";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";
import { Button } from "@/components/ui/button";
import {
  xmlToJson,
  jsonToXml,
  XML_JSON_FILE_ACCEPT,
  XML_JSON_SAMPLE_XML,
  XML_JSON_SAMPLE_JSON,
  XML_JSON_PLACEHOLDER_XML,
  XML_JSON_PLACEHOLDER_JSON,
  XML_JSON_PLACEHOLDER_OUTPUT,
} from "@/utils/xmlJson";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const XmlJsonPage = () => {
  const tool = useCurrentTool();
  const [mode, setMode] = useState<"xml2json" | "json2xml">("xml2json");
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

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

  const sampleInput = mode === "xml2json" ? XML_JSON_SAMPLE_XML : XML_JSON_SAMPLE_JSON;
  const inputPlaceholder = mode === "xml2json" ? XML_JSON_PLACEHOLDER_XML : XML_JSON_PLACEHOLDER_JSON;
  const inputLang = mode === "xml2json" ? "xml" : "json";
  const outputLang = mode === "xml2json" ? "json" : "xml";

  return (
    <ToolLayout title={tool?.label ?? "XML ↔ JSON"} description={tool?.description ?? "Convert between XML and JSON"}>
      <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0 mb-3">
        <Button size="sm" variant={mode === "xml2json" ? "default" : "outline"} onClick={() => setMode("xml2json")} className="h-7 text-xs">
          XML → JSON
        </Button>
        <Button size="sm" variant={mode === "json2xml" ? "default" : "outline"} onClick={() => setMode("json2xml")} className="h-7 text-xs">
          JSON → XML
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "xml2json" ? "XML" : "JSON"}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => setInput(sampleInput)} />
                <ClearButton onClick={() => setInput("")} />
                <FileUploadButton accept={XML_JSON_FILE_ACCEPT} onText={setInput} />
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language={inputLang} placeholder={inputPlaceholder} fillHeight />
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
            <CodeEditor value={output} readOnly language={outputLang} placeholder={XML_JSON_PLACEHOLDER_OUTPUT} fillHeight />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default XmlJsonPage;
