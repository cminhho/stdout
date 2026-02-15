import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
  const [length, setLength] = useState(32);
  const [count, setCount] = useState(5);
  const [preset, setPreset] = useState<Preset>("alphanumeric");
  const [customChars, setCustomChars] = useState("");
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");

  const getChars = useCallback((): string => {
    switch (preset) {
      case "alphanumeric": return charSets.alphanumeric;
      case "hex": return charSets.hex;
      case "base64url": return charSets.alphanumeric + "-_";
      case "custom": return customChars || charSets.alphanumeric;
    }
  }, [preset, customChars]);

  const generate = useCallback(() => {
    const chars = getChars();
    const results: string[] = [];
    for (let i = 0; i < count; i++) {
      const arr = new Uint32Array(length);
      crypto.getRandomValues(arr);
      const str = Array.from(arr, (v) => chars[v % chars.length]).join("");
      results.push(prefix + str + suffix);
    }
    setStrings(results);
  }, [length, count, preset, customChars, prefix, suffix, getChars]);

  const outputText = strings.join("\n");

  return (
    <ToolLayout title={tool?.label ?? "Random String"} description={tool?.description ?? "Generate cryptographically secure random strings"}>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Count</Label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              className="input-compact w-16"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Length</Label>
            <input
              type="number"
              min={1}
              max={256}
              value={length}
              onChange={(e) => setLength(Math.max(1, Math.min(256, Number(e.target.value) || 1)))}
              className="input-compact w-16"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Set</Label>
            <div className="flex gap-1 flex-wrap">
              {(["alphanumeric", "hex", "base64url", "custom"] as Preset[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${preset === p ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          {preset === "custom" && (
            <input
              value={customChars}
              onChange={(e) => setCustomChars(e.target.value)}
              placeholder="Custom chars..."
              className="input-compact w-32 min-w-0 font-mono"
            />
          )}
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Prefix</Label>
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} className="input-compact w-24 min-w-0 font-mono" placeholder="" />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Suffix</Label>
            <input value={suffix} onChange={(e) => setSuffix(e.target.value)} className="input-compact w-24 min-w-0 font-mono" placeholder="" />
          </div>
          <Button size="sm" onClick={generate}>Generate</Button>
        </div>

        <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader label={strings.length ? `${strings.length} string${strings.length > 1 ? "s" : ""}` : "Output"} text={outputText} />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CodeEditor
              value={outputText}
              readOnly
              language="text"
              placeholder="Click Generate to create random strings..."
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
