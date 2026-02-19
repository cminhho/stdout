import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eraser } from "lucide-react";

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

/** UUID v7 (RFC 9562): time-ordered, 48-bit timestamp ms + version 7 + random */
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
  const tool = useCurrentTool();
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
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

  return (
    <ToolLayout title={tool?.label ?? "UUID Generator"} description={tool?.description ?? "Generate UUIDs (v1, v4, v7)"}>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
        <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader
            label={uuids.length ? `${uuids.length} UUIDs` : "Output"}
            text={outputText}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground shrink-0">Count</Label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    className="h-7 w-14 rounded border border-input bg-background px-2 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value as "v1" | "v4" | "v7")}
                  className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0"
                >
                  <option value="v1">v1</option>
                  <option value="v4">v4</option>
                  <option value="v7">v7</option>
                </select>
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} className="accent-primary rounded border-input" />
                  Upper
                </label>
                <label className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={hyphens} onChange={(e) => setHyphens(e.target.checked)} className="accent-primary rounded border-input" />
                  Hyphens
                </label>
                <Button size="sm" className="h-7 text-xs" onClick={generate}>Generate</Button>
                {outputText && (
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setUuids([])}>
                    <Eraser className="h-3.5 w-3.5 mr-1.5" />
                    Clear
                  </Button>
                )}
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CodeEditor
              value={outputText}
              readOnly
              language="text"
              placeholder="Click Generate to create UUIDs..."
              fillHeight
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default UuidPage;
