import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { FileCode, Eraser } from "lucide-react";
import IndentSelect, { type IndentOption } from "@/components/IndentSelect";

const selectClass = "h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0";

const parsePem = (pem: string) => {
  const lines = pem.trim().split("\n");
  const type = lines[0]?.match(/-----BEGIN (.+)-----/)?.[1] ?? "UNKNOWN";
  const body = lines.filter((l) => !l.startsWith("-----")).join("");
  const bytes = atob(body);
  const hex = Array.from(bytes, (c) => c.charCodeAt(0).toString(16).padStart(2, "0")).join(":");
  return {
    type,
    base64Length: body.length,
    byteLength: bytes.length,
    fingerprint: hex.slice(0, 59) + "...",
    raw: body,
  };
};

const SAMPLE_PEM = "-----BEGIN CERTIFICATE-----\nMIIBkTCB+wIJAK...\n-----END CERTIFICATE-----";

const CertificatePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof parsePem> | null>(null);
  const [error, setError] = useState("");
  const [indent, setIndent] = useState<IndentOption>(2);

  const displayJson = useMemo(() => {
    if (!result) return "";
    const space = indent === "minified" ? undefined : indent === "tab" ? "\t" : (indent as number);
    return JSON.stringify({ ...result, raw: result.raw ? "(base64 omitted)" : undefined }, null, space);
  }, [result, indent]);

  const decode = () => {
    try {
      setError("");
      setResult(parsePem(input));
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  };

  return (
    <ToolLayout title={tool?.label ?? "Certificate Inspector"} description={tool?.description ?? "Inspect and decode X.509 certificates"}>
      <div className="flex gap-2 mb-4">
        <Button size="sm" onClick={decode}>Decode</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="PEM Input"
            extra={
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(SAMPLE_PEM); setResult(null); setError(""); }}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setInput(""); setResult(null); setError(""); }}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="-----BEGIN CERTIFICATE-----&#10;..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Info"
            text={displayJson}
            extra={result ? <IndentSelect value={indent} onChange={setIndent} className={selectClass} /> : undefined}
          />
          {error && <div className="code-block text-destructive text-xs shrink-0">⚠ {error}</div>}
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={displayJson}
              readOnly
              language="json"
              placeholder="Paste a PEM certificate and click Decode..."
              fillHeight
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default CertificatePage;
