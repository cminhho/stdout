import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FILE_ENCODING_LABELS,
  decodeBytes,
  encodeToUtf8Bytes,
  bytesToHex,
} from "@/utils/encode";

const base64ToBytes = (s: string): Uint8Array => {
  const binary = atob(s.replace(/\s/g, ""));
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
};

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const FileEncodingPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"decode" | "encode">("decode");
  const [decodeEncoding, setDecodeEncoding] = useState<string>("utf-8");
  const [bytesFormat, setBytesFormat] = useState<"hex" | "base64">("hex");

  const runDecode = () => {
    try {
      setError("");
      const raw = input.trim();
      const bytes =
        bytesFormat === "hex"
          ? (() => {
              const s = raw.replace(/\s/g, "");
              if (!/^[0-9a-fA-F]*$/.test(s) || s.length % 2 !== 0)
                throw new Error("Invalid hex: even-length hex string required");
              const out = new Uint8Array(s.length / 2);
              for (let i = 0; i < out.length; i++)
                out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
              return out;
            })()
          : base64ToBytes(raw);
      setOutput(decodeBytes(bytes, decodeEncoding));
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const runEncode = () => {
    try {
      setError("");
      const bytes = encodeToUtf8Bytes(input);
      setOutput(bytesFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes));
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const run = () => (mode === "decode" ? runDecode() : runEncode());

  return (
    <ToolLayout
      title={tool?.label ?? "Convert File Encoding"}
      description={tool?.description ?? "Decode bytes from charset or encode text to UTF-8"}
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as "decode" | "encode")}>
            <SelectTrigger className="w-[120px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decode">Decode bytes → text</SelectItem>
              <SelectItem value="encode">Encode text → UTF-8 bytes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {mode === "decode" && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">From encoding</Label>
            <Select value={decodeEncoding} onValueChange={setDecodeEncoding}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FILE_ENCODING_LABELS.map((enc) => (
                  <SelectItem key={enc} value={enc}>
                    {enc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Bytes as</Label>
          <Select value={bytesFormat} onValueChange={(v) => setBytesFormat(v as "hex" | "base64")}>
            <SelectTrigger className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">Hex</SelectItem>
              <SelectItem value="base64">Base64</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={run}>
          {mode === "decode" ? "Decode" : "Encode"}
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={mode === "decode" ? "Bytes (hex or base64)" : "Text"}
            text={input}
            onClear={() => {
              setInput("");
              setOutput("");
              setError("");
            }}
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={input}
              onChange={setInput}
              language="text"
              placeholder={
                mode === "decode"
                  ? "Paste hex (e.g. 48656c6c6f) or base64..."
                  : "Enter text to encode as UTF-8 bytes..."
              }
              fillHeight
            />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader label={mode === "decode" ? "Decoded text" : "UTF-8 bytes"} text={output} />
          {error && (
            <div className="code-block text-destructive text-xs shrink-0">⚠ {error}</div>
          )}
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={output || ""}
              readOnly
              language="text"
              placeholder="Result will appear here..."
              fillHeight
            />
          </div>
        </div>
      </div>
      {mode === "encode" && (
        <p className="text-xs text-muted-foreground mt-2">
          Encode output is UTF-8 only (browser limitation). Use Decode mode for other encodings.
        </p>
      )}
    </ToolLayout>
  );
};

export default FileEncodingPage;
