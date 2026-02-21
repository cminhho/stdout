import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ClearButton } from "@/components/ClearButton";
import { SampleButton } from "@/components/SampleButton";

const charSets = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  hex: "0123456789abcdef",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  alphanumeric: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
};

type Preset = "alphanumeric" | "hex" | "base64url" | "custom";

const RandomStringPage = () => {
  const tool = useCurrentTool();
  const [strings, setStrings] = useState<string[]>([]);
  const [length, setLength] = useState(48);
  const [count, setCount] = useState(10);
  const [preset, setPreset] = useState<Preset>("alphanumeric");
  const [customChars, setCustomChars] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [colorize, setColorize] = useState(false);

  useEffect(() => {
    let chars: string;
    switch (preset) {
      case "alphanumeric": chars = charSets.alphanumeric; break;
      case "hex": chars = charSets.hex; break;
      case "base64url": chars = charSets.alphanumeric + "-_"; break;
      default: chars = customChars || charSets.alphanumeric;
    }
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      const str = Array.from(arr, (v) => chars[v % chars.length]).join("");
      results.push(prefix + str + suffix);
    }
    setStrings(results);
  }, [count, length, prefix, suffix, preset, customChars]);

  const outputText = strings.join("\n");
  const inputClass = "h-8 w-full rounded border border-input bg-background px-2.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";

  const loadSample = () => {
    setLength(32);
    setCount(5);
    setPreset("alphanumeric");
    setCustomChars("");
    setPrefix("");
    setSuffix("");
  };

  return (
    <ToolLayout title={tool?.label ?? "Random String"} description={tool?.description ?? "Generate cryptographically secure random strings"}>
      <div className="grid grid-cols-1 lg:grid-cols-[22rem_1fr] tool-content-grid flex-1 min-h-0">
        {/* Input options column — fixed width */}
        <div className="tool-panel flex flex-col min-h-0 overflow-auto min-w-0">
          <PanelHeader
            label="Options"
            extra={<SampleButton onClick={loadSample} />}
          />
          <div className="space-y-4 shrink-0">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Length</Label>
              <Input
                type="number"
                min={1}
                max={256}
                value={length}
                onChange={(e) => setLength(Math.max(1, Math.min(256, Number(e.target.value) || 1)))}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Character set</Label>
              <div className="flex flex-col gap-1.5">
                {(["alphanumeric", "hex", "base64url", "custom"] as Preset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreset(p)}
                    className={`h-8 px-3 text-xs rounded border text-left transition-colors ${preset === p ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background text-muted-foreground hover:text-foreground"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {preset === "custom" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Custom characters</Label>
                <Input value={customChars} onChange={(e) => setCustomChars(e.target.value)} placeholder="e.g. abc123" className={inputClass} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Prefix</Label>
              <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} className={inputClass} placeholder="Optional" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Suffix</Label>
              <Input value={suffix} onChange={(e) => setSuffix(e.target.value)} className={inputClass} placeholder="Optional" />
            </div>
          </div>
        </div>

        {/* Output column — 70% */}
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label={strings.length ? `${strings.length} string${strings.length > 1 ? "s" : ""}` : "Output"}
            text={outputText}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs text-muted-foreground shrink-0">Count</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    className="h-7 w-14 font-mono text-xs"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={colorize}
                    onChange={(e) => setColorize(e.target.checked)}
                    className="rounded border-input accent-primary"
                  />
                  Color
                </label>
                <ClearButton onClick={() => setStrings([])} />
              </div>
            }
          />
          <div className={`flex-1 min-h-0 flex flex-col overflow-hidden ${colorize ? "rounded-md ring-1 ring-primary/30" : ""}`}>
            <CodeEditor
              value={outputText}
              readOnly
              language="text"
              placeholder="Results update automatically..."
              fillHeight
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default RandomStringPage;
