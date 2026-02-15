import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";

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

const CertificatePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ReturnType<typeof parsePem> | null>(null);
  const [error, setError] = useState("");

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
          <PanelHeader label="PEM Input" text={input} onClear={() => { setInput(""); setResult(null); setError(""); }} />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor value={input} onChange={setInput} language="plaintext" placeholder="-----BEGIN CERTIFICATE-----&#10;..." fillHeight />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label="Info" text={result ? JSON.stringify(result, null, 2) : ""} />
          {error && <div className="code-block text-destructive text-xs shrink-0">⚠ {error}</div>}
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={result ? JSON.stringify({ ...result, raw: result.raw ? "(base64 omitted)" : undefined }, null, 2) : ""}
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
