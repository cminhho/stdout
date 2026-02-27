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

const generateUUIDv1Like = (): string => {
  const now = Date.now();
  const timeLow = (now & 0xffffffff).toString(16).padStart(8, "0");
  const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, "0");
  const timeHi = (((now >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, "0");
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  const clock = ((arr[0] & 0x3f) | 0x80).toString(16).padStart(2, "0") + arr[1].toString(16).padStart(2, "0");
  const node = Array.from(arr.slice(2), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${timeLow}-${timeMid}-${timeHi}-${clock}-${node}`;
};

const generateUUIDv7 = (): string => {
  const ts = Date.now() & 0xffffffffffff;
  const timeLow = ((ts >> 16) & 0xffffffff).toString(16).padStart(8, "0");
  const timeMid = (ts & 0xffff).toString(16).padStart(4, "0");
  const arr = new Uint8Array(10);
  crypto.getRandomValues(arr);
  const timeHi = (0x7000 | ((arr[0] & 0x0f) << 8) | arr[1]).toString(16).padStart(4, "0");
  const clockSeqHi = (0x80 | (arr[2] & 0x3f)).toString(16).padStart(2, "0");
  const clockSeqLow = arr[3].toString(16).padStart(2, "0");
  const node = Array.from(arr.slice(4), (b) => b.toString(16).padStart(2, "0")).join("");
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeqHi}${clockSeqLow}-${node}`;
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
      return generateUUIDv1Like();
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
      <div className="toolbar-actions-row">
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
      </div>
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
