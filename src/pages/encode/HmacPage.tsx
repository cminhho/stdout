import { useState, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SegmentGroup } from "@/components/SegmentGroup";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type HmacAlgo = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
const ALGOS: HmacAlgo[] = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"];
const ALGO_OPTIONS: { value: HmacAlgo; label: string }[] = ALGOS.map((a) => ({ value: a, label: a }));

const computeHmac = async (message: string, secret: string, algo: HmacAlgo): Promise<string> => {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: algo }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const SAMPLE_MESSAGE = "message to sign";

const HmacPage = () => {
  const [message, setMessage] = useState("");
  const [secret, setSecret] = useState("");
  const [algo, setAlgo] = useState<HmacAlgo>("SHA-256");
  const [output, setOutput] = useState("");

  const generate = useCallback(async () => {
    if (!message || !secret) return;
    setOutput(await computeHmac(message, secret, algo));
  }, [message, secret, algo]);

  const clearAll = useCallback(() => {
    setMessage("");
    setOutput("");
  }, []);

  return (
    <TwoPanelToolLayout
      topSection={
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Label className="tool-field-label shrink-0">Algorithm</Label>
            <SegmentGroup<HmacAlgo>
              value={algo}
              onValueChange={setAlgo}
              options={ALGO_OPTIONS}
              ariaLabel="HMAC algorithm"
              size="xs"
            />
          </div>
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xs">
            <Label className="tool-field-label shrink-0">Secret</Label>
            <Input
              type="text"
              className="h-7 flex-1 min-w-0 font-mono text-xs"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Secret key..."
            />
          </div>
          <Button size="xs" onClick={generate} disabled={!message.trim() || !secret.trim()}>
            Generate
          </Button>
        </div>
      }
      inputPane={{
        inputToolbar: {
          onSample: () => {
            setMessage(SAMPLE_MESSAGE);
            setOutput("");
          },
          setInput: setMessage,
          fileAccept: ".txt,text/plain",
          onFileText: (t) => {
            setMessage(t);
            setOutput("");
          },
        },
        onClear: clearAll,
        inputEditor: {
          value: message,
          onChange: setMessage,
          language: "text",
          placeholder: "Enter message to sign...",
        },
      }}
      outputPane={{
        title: `HMAC-${algo}`,
        copyText: output || undefined,
        outputEditor: {
          value: output,
          language: "text",
          placeholder: "HMAC output will appear here...",
          outputKey: algo,
        },
      }}
    />
  );
};

export default HmacPage;
