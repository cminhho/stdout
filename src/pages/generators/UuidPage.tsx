import { useState, useCallback } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import CodeEditor from "@/components/common/CodeEditor";
import { SelectWithOptions } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClearButton } from "@/components/common/ClearButton";

const UUID_VERSION_OPTIONS = [
  { value: "v1", label: "v1" },
  { value: "v4", label: "v4" },
  { value: "v7", label: "v7" },
] as const;

const generateUUIDv4 = (): string => crypto.randomUUID();

function formatUuidBytes(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID_EPOCH_OFFSET_100NS = 0x01b21dd213814000n;
let lastV1Timestamp = 0n;

const v1Node = crypto.getRandomValues(new Uint8Array(6));
v1Node[0] |= 0x01;

const v1ClockSeed = crypto.getRandomValues(new Uint8Array(2));
const v1ClockSeq = (((v1ClockSeed[0] << 8) | v1ClockSeed[1]) & 0x3fff) >>> 0;

const generateUUIDv1 = (): string => {
  let timestamp = BigInt(Date.now()) * 10000n + UUID_EPOCH_OFFSET_100NS;
  if (timestamp <= lastV1Timestamp) timestamp = lastV1Timestamp + 1n;
  lastV1Timestamp = timestamp;

  const timeLow = Number(timestamp & 0xffffffffn);
  const timeMid = Number((timestamp >> 32n) & 0xffffn);
  const timeHiAndVersion = Number((timestamp >> 48n) & 0x0fffn) | 0x1000;
  const bytes = new Uint8Array(16);
  bytes[0] = (timeLow >>> 24) & 0xff;
  bytes[1] = (timeLow >>> 16) & 0xff;
  bytes[2] = (timeLow >>> 8) & 0xff;
  bytes[3] = timeLow & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = (timeHiAndVersion >>> 8) & 0xff;
  bytes[7] = timeHiAndVersion & 0xff;
  bytes[8] = ((v1ClockSeq >>> 8) & 0x3f) | 0x80;
  bytes[9] = v1ClockSeq & 0xff;
  bytes.set(v1Node, 10);
  return formatUuidBytes(bytes);
};

const generateUUIDv7 = (): string => {
  const timestamp = BigInt(Date.now());
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  const bytes = new Uint8Array(16);
  bytes[0] = Number((timestamp >> 40n) & 0xffn);
  bytes[1] = Number((timestamp >> 32n) & 0xffn);
  bytes[2] = Number((timestamp >> 24n) & 0xffn);
  bytes[3] = Number((timestamp >> 16n) & 0xffn);
  bytes[4] = Number((timestamp >> 8n) & 0xffn);
  bytes[5] = Number(timestamp & 0xffn);
  bytes[6] = 0x70 | (arr[0] & 0x0f);
  bytes[7] = arr[1];
  bytes[8] = 0x80 | (arr[2] & 0x3f);
  bytes.set(arr.slice(3), 9);
  return formatUuidBytes(bytes);
};

const UuidPage = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [version, setVersion] = useState<"v1" | "v4" | "v7">("v4");
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);

  const generate = useCallback(() => {
    const raw = Array.from({ length: count }, () => {
      if (version === "v4") return generateUUIDv4();
      if (version === "v7") return generateUUIDv7();
      return generateUUIDv1();
    });
    const formatted = raw.map((u) => {
      const result = hyphens ? u : u.replace(/-/g, "");
      return uppercase ? result.toUpperCase() : result.toLowerCase();
    });
    setUuids(formatted);
  }, [count, version, uppercase, hyphens]);

  const outputText = uuids.join("\n");

  const pane = {
    title: "Output",
    copyText: outputText,
    toolbar: (
      <>
        <div className="flex items-center gap-1.5">
          <Label className="tool-field-label shrink-0">Count</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
            className="input-compact w-14"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Label className="tool-field-label shrink-0">Version</Label>
          <SelectWithOptions
            size="xs"
            variant="secondary"
            value={version}
            onValueChange={(v) => setVersion(v as "v1" | "v4" | "v7")}
            options={UUID_VERSION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            title="UUID version"
            aria-label="UUID version"
          />
        </div>
        <label className="flex items-center gap-1 tool-caption cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="accent-primary rounded border-input" />
          Upper
        </label>
        <label className="flex items-center gap-1 tool-caption cursor-pointer whitespace-nowrap">
          <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="accent-primary rounded border-input" />
          Hyphens
        </label>
        <Button size="xs" onClick={generate}>
          Generate
        </Button>
        <ClearButton onClick={() => setUuids([])} />
      </>
    ),
    children: (
      <div className="flex-1 min-h-0 overflow-hidden">
        <CodeEditor
          value={outputText}
          readOnly
          language="text"
          placeholder="Click Generate to create UUIDs..."
          fillHeight
          showLineNumbers={false}
        />
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default UuidPage;
