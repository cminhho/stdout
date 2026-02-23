import { useState, useRef, useCallback } from "react";
import QRCode from "qrcode";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";

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

  const setInputAndReset = useCallback((v: string) => {
    setInput(v);
    setGenerated(false);
  }, []);

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? "QR Code"}
      description={tool?.description ?? "Generate QR codes from text or URLs"}
      inputPane={{
        title: "Content",
        inputToolbar: {
          onSample: () => setInputAndReset(SAMPLE_CONTENT),
          setInput: setInputAndReset,
          fileAccept: ".txt,text/plain",
          onFileText: setInputAndReset,
        },
        inputToolbarExtra: (
          <Button size="xs" onClick={generate} disabled={!input.trim()}>
            Generate QR Code
          </Button>
        ),
        inputEditor: {
          value: input,
          onChange: setInputAndReset,
          language: "text",
          placeholder: "Enter text or URL...",
        },
      }}
      outputPane={{
        title: "QR Code",
        children: (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 overflow-hidden p-4">
            <canvas ref={canvasRef} className="rounded-md max-w-full" />
            {generated ? (
              <Button size="xs" variant="outline" onClick={download}>
                Download PNG
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground text-center">Enter content and click Generate QR Code.</p>
            )}
          </div>
        ),
      }}
    />
  );
};

export default QrCodePage;
