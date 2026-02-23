import { useState } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import FileUploadButton from "@/components/FileUploadButton";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import ToolAlert from "@/components/ToolAlert";
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

const SAMPLE_HEX = "48656c6c6f";
const SAMPLE_BASE64 = "SGVsbG8=";
const SAMPLE_TEXT = "Hello, UTF-8!";

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

  const setInputAndClear = (v: string) => {
    setInput(v);
    setOutput("");
    setError("");
  };

  const handleSample = () => {
    const sample =
      mode === "decode"
        ? bytesFormat === "hex"
          ? SAMPLE_HEX
          : SAMPLE_BASE64
        : SAMPLE_TEXT;
    setInputAndClear(sample);
  };

  const topSection = (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Mode</Label>
          <Select value={mode} onValueChange={(v) => setMode(v as "decode" | "encode")}>
            <SelectTrigger variant="secondary" className="w-[120px] h-8">
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
              <SelectTrigger variant="secondary" className="w-[140px] h-8">
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
            <SelectTrigger variant="secondary" className="w-[100px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">Hex</SelectItem>
              <SelectItem value="base64">Base64</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="xs" onClick={run}>
          {mode === "decode" ? "Decode" : "Encode"}
        </Button>
      </div>
      {mode === "encode" && (
        <p className="text-xs text-muted-foreground">
          Encode output is UTF-8 only (browser limitation). Use Decode mode for other encodings.
        </p>
      )}
    </div>
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? "Convert File Encoding"}
      description={tool?.description ?? "Decode bytes from charset or encode text to UTF-8"}
      topSection={topSection}
      inputPane={{
        title: mode === "decode" ? "Bytes (hex or base64)" : "Text",
        inputToolbar: {
          onSample: handleSample,
          setInput: setInputAndClear,
          fileAccept: ".txt,text/plain",
          onFileText: setInputAndClear,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder:
            mode === "decode"
              ? "Paste hex (e.g. 48656c6c6f) or base64..."
              : "Enter text to encode as UTF-8 bytes...",
        },
      }}
      outputPane={{
        title: mode === "decode" ? "Decoded text" : "UTF-8 bytes",
        copyText: output || undefined,
        children: (
          <div className="flex flex-col flex-1 min-h-0 gap-2">
            {error && (
              <ToolAlert variant="error" message={error} prefix="⚠ " className="shrink-0" />
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
        ),
      }}
    />
  );
};

export default FileEncodingPage;
