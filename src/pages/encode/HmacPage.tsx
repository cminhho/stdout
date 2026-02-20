import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton, SampleButton } from "@/components/ToolActionButtons";

type HmacAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const algos: HmacAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];

const computeHmac = async (message: string, secret: string, algo: HmacAlgo): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
};

const SAMPLE_MESSAGE = "message to sign";

const HmacPage = () => {
  const tool = useCurrentTool();
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<HmacAlgo>("SHA-256");
  const [output, setOutput] = useState("");

  const generate = useCallback(async () => {
    if (!message || !secret) return;
    setOutput(await computeHmac(message, secret, algo));
  }, [message, secret, algo]);

  return (
    <ToolLayout title={tool?.label ?? "HMAC Generator"} description={tool?.description ?? "Generate HMAC signatures"}>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Algorithm</Label>
            <div className="flex gap-1">
              {algos.map((a) => (
                <button
                  key={a}
                  onClick={() => setAlgo(a)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${algo === a ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
            <Label className="text-xs text-muted-foreground shrink-0">Secret</Label>
            <Input
              type="text"
              className="h-7 flex-1 min-w-0 font-mono text-xs"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Secret key..."
            />
          </div>
          <Button size="sm" onClick={generate} disabled={!message.trim() || !secret.trim()}>Generate</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader
            label="Message"
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <SampleButton onClick={() => { setMessage(SAMPLE_MESSAGE); setOutput(""); }} />
                <ClearButton onClick={() => { setMessage(""); setOutput(""); }} />
                <FileUploadButton accept=".txt,text/plain" onText={setMessage} />
              </div>
            }
          />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <CodeEditor value={message} onChange={setMessage} language="text" placeholder="Enter message to sign..." fillHeight />
            </div>
          </div>
          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader label={`HMAC-${algo}`} text={output} />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <CodeEditor value={output} readOnly language="text" placeholder="HMAC output will appear here..." fillHeight showLineNumbers={false} />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default HmacPage;
