import { useState, useMemo, useCallback } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import ToolAlert from "@/components/ToolAlert";
import { SegmentGroup } from "@/components/SegmentGroup";
import { SelectWithOptions } from "@/components/ui/select";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";
import FileUploadButton from "@/components/FileUploadButton";
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

const MODE_OPTIONS = [
  { value: "decode" as const, label: "Decode" },
  { value: "encode" as const, label: "Encode" },
];

const BYTES_FORMAT_OPTIONS = [
  { value: "hex" as const, label: "Hex" },
  { value: "base64" as const, label: "Base64" },
];

const SAMPLE_HEX = "48656c6c6f";
const SAMPLE_BASE64 = "SGVsbG8=";
const SAMPLE_TEXT = "Hello, UTF-8!";

const FileEncodingPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"decode" | "encode">("decode");
  const [decodeEncoding, setDecodeEncoding] = useState<string>("utf-8");
  const [bytesFormat, setBytesFormat] = useState<"hex" | "base64">("hex");

  const { output, error } = useMemo(() => {
    const raw = input.trim();
    if (!raw) return { output: "", error: "" };
    try {
      if (mode === "decode") {
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
        return { output: decodeBytes(bytes, decodeEncoding), error: "" };
      }
      const bytes = encodeToUtf8Bytes(input);
      return {
        output: bytesFormat === "hex" ? bytesToHex(bytes) : bytesToBase64(bytes),
        error: "",
      };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode, decodeEncoding, bytesFormat]);

  const setModeWithCleanup = useCallback((next: "decode" | "encode") => {
    setMode(next);
    setInput("");
  }, []);

  const handleSample = useCallback(() => {
    const sample =
      mode === "decode"
        ? bytesFormat === "hex"
          ? SAMPLE_HEX
          : SAMPLE_BASE64
        : SAMPLE_TEXT;
    setInput(sample);
  }, [mode, bytesFormat]);

  const topSection = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-[var(--spacing-block-gap)]">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground shrink-0">Mode</Label>
          <SegmentGroup<"decode" | "encode">
            value={mode}
            onValueChange={setModeWithCleanup}
            options={MODE_OPTIONS}
            ariaLabel="Decode or encode"
            size="xs"
          />
        </div>
        {mode === "decode" && (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">From encoding</Label>
            <SelectWithOptions
              value={decodeEncoding}
              onValueChange={setDecodeEncoding}
              options={FILE_ENCODING_LABELS}
              size="xs"
              variant="secondary"
              triggerClassName="min-w-[8.75rem]"
              aria-label="Source text encoding"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground shrink-0">Bytes as</Label>
          <SelectWithOptions<"hex" | "base64">
            value={bytesFormat}
            onValueChange={(v) => setBytesFormat(v)}
            options={BYTES_FORMAT_OPTIONS}
            size="xs"
            variant="secondary"
            triggerClassName="min-w-[5.25rem]"
            aria-label="Bytes format (hex or base64)"
          />
        </div>
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
      tool={tool ?? undefined}
      title={tool?.label ?? "Convert File Encoding"}
      description={tool?.description ?? "Decode bytes from charset or encode text to UTF-8"}
      topSection={topSection}
      inputPane={{
        title: mode === "decode" ? "Bytes (hex or base64)" : "Text",
        toolbar: (
          <>
            <SampleButton onClick={handleSample} />
            <ClearButton onClick={() => setInput("")} />
            <FileUploadButton accept=".txt,text/plain" onText={setInput} />
          </>
        ),
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
        toolbar: <ClearButton onClick={() => setInput("")} />,
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
