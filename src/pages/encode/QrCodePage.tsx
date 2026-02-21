import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";

const SAMPLE_CONTENT = "https://example.com";

const QrCodePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(async () => {
    if (!input.trim() || !canvasRef.current) return;
    await QRCode.toCanvas(canvasRef.current, input, {
      width: 280,
      margin: 2,
      color: { dark: "#22c55e", light: "#0f1419" },
    });
    setGenerated(true);
  }, [input]);

  const download = useCallback(() => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qrcode.png";
    a.click();
  }, []);

  return (
    <ToolLayout title={tool?.label ?? "QR Code"} description={tool?.description ?? "Generate QR codes from text or URLs"}>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          <Button size="sm" onClick={generate} disabled={!input.trim()}>
            Generate QR Code
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 tool-content-grid flex-1 min-h-0">
          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader
              label="Content"
              extra={
                <div className="flex items-center gap-2 flex-wrap">
                  <SampleButton onClick={() => { setInput(SAMPLE_CONTENT); setGenerated(false); }} />
                  <ClearButton onClick={() => { setInput(""); setGenerated(false); }} />
                  <FileUploadButton accept=".txt,text/plain" onText={(t) => { setInput(t); setGenerated(false); }} />
                </div>
              }
            />
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <CodeEditor
                value={input}
                onChange={setInput}
                language="text"
                placeholder="Enter text or URL..."
                fillHeight
              />
            </div>
          </div>
          <div className="tool-panel flex flex-col flex-1 min-h-0">
            <PanelHeader label="QR Code" text="" />
            <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 overflow-hidden p-4">
              <canvas ref={canvasRef} className="rounded-md max-w-full" />
              {generated ? (
                <Button size="sm" variant="outline" onClick={download}>Download PNG</Button>
              ) : (
                <p className="text-xs text-muted-foreground text-center">Enter content and click Generate QR Code.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default QrCodePage;
