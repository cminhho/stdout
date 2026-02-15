import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Simple ASCII art font - each character is 6 lines tall
const FONT: Record<string, string[]> = {
  A: ["  ██  ", " █  █ ", "█    █", "██████", "█    █", "█    █"],
  B: ["█████ ", "█    █", "█████ ", "█    █", "█    █", "█████ "],
  C: [" ████ ", "█    █", "█     ", "█     ", "█    █", " ████ "],
  D: ["████  ", "█   █ ", "█    █", "█    █", "█   █ ", "████  "],
  E: ["██████", "█     ", "████  ", "█     ", "█     ", "██████"],
  F: ["██████", "█     ", "████  ", "█     ", "█     ", "█     "],
  G: [" ████ ", "█     ", "█  ███", "█    █", "█    █", " ████ "],
  H: ["█    █", "█    █", "██████", "█    █", "█    █", "█    █"],
  I: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  ", "██████"],
  J: ["   ███", "    █ ", "    █ ", "    █ ", "█   █ ", " ███  "],
  K: ["█   █ ", "█  █  ", "███   ", "█  █  ", "█   █ ", "█    █"],
  L: ["█     ", "█     ", "█     ", "█     ", "█     ", "██████"],
  M: ["█    █", "██  ██", "█ ██ █", "█    █", "█    █", "█    █"],
  N: ["█    █", "██   █", "█ █  █", "█  █ █", "█   ██", "█    █"],
  O: [" ████ ", "█    █", "█    █", "█    █", "█    █", " ████ "],
  P: ["█████ ", "█    █", "█████ ", "█     ", "█     ", "█     "],
  Q: [" ████ ", "█    █", "█    █", "█  █ █", "█   █ ", " ███ █"],
  R: ["█████ ", "█    █", "█████ ", "█  █  ", "█   █ ", "█    █"],
  S: [" ████ ", "█     ", " ████ ", "     █", "     █", "█████ "],
  T: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
  U: ["█    █", "█    █", "█    █", "█    █", "█    █", " ████ "],
  V: ["█    █", "█    █", "█    █", " █  █ ", " █  █ ", "  ██  "],
  W: ["█    █", "█    █", "█    █", "█ ██ █", "██  ██", "█    █"],
  X: ["█    █", " █  █ ", "  ██  ", "  ██  ", " █  █ ", "█    █"],
  Y: ["█    █", " █  █ ", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
  Z: ["██████", "    █ ", "   █  ", "  █   ", " █    ", "██████"],
  "0": [" ████ ", "█   ██", "█  █ █", "█ █  █", "██   █", " ████ "],
  "1": ["  █   ", " ██   ", "  █   ", "  █   ", "  █   ", " ███  "],
  "2": [" ████ ", "█    █", "    █ ", "  ██  ", " █    ", "██████"],
  "3": [" ████ ", "█    █", "   ██ ", "     █", "█    █", " ████ "],
  "4": ["   █  ", "  ██  ", " █ █  ", "█  █  ", "██████", "   █  "],
  "5": ["██████", "█     ", "█████ ", "     █", "     █", "█████ "],
  "6": [" ████ ", "█     ", "█████ ", "█    █", "█    █", " ████ "],
  "7": ["██████", "    █ ", "   █  ", "  █   ", " █    ", "█     "],
  "8": [" ████ ", "█    █", " ████ ", "█    █", "█    █", " ████ "],
  "9": [" ████ ", "█    █", " █████", "     █", "    █ ", " ███  "],
  " ": ["      ", "      ", "      ", "      ", "      ", "      "],
  "!": ["  ██  ", "  ██  ", "  ██  ", "  ██  ", "      ", "  ██  "],
  "?": [" ████ ", "█    █", "   ██ ", "  █   ", "      ", "  █   "],
  ".": ["      ", "      ", "      ", "      ", "      ", "  ██  "],
  ",": ["      ", "      ", "      ", "      ", "  ██  ", " ██   "],
  "-": ["      ", "      ", " ████ ", "      ", "      ", "      "],
  "_": ["      ", "      ", "      ", "      ", "      ", "██████"],
  "@": [" ████ ", "█    █", "█ ██ █", "█ ████", "█     ", " ████ "],
  "#": [" █ █  ", "██████", " █ █  ", " █ █  ", "██████", " █ █  "],
};

const CHAR_MAP: Record<string, string> = {
  block: "█",
  hash: "#",
  asterisk: "*",
  at: "@",
  dollar: "$",
  plus: "+",
};

const AsciiArtPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("HELLO");
  const [charStyle, setCharStyle] = useState("block");
  const [spacing, setSpacing] = useState(2);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    const text = input.toUpperCase();
    const lines: string[] = ["", "", "", "", "", ""];
    const spacer = " ".repeat(spacing);
    const ch = CHAR_MAP[charStyle] || "█";

    for (const char of text) {
      const glyph = FONT[char];
      if (glyph) {
        for (let row = 0; row < 6; row++) {
          lines[row] += (lines[row] ? spacer : "") + glyph[row].replace(/█/g, ch);
        }
      }
    }
    return lines.join("\n");
  }, [input, charStyle, spacing]);

  return (
    <ToolLayout title={tool?.label ?? "ASCII Art"} description={tool?.description ?? "Turn text into ASCII art"}>
      <div className="flex flex-col flex-1 min-h-0 w-full gap-4">
        <div className="tool-toolbar flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-sm">
            <Label className="text-xs text-muted-foreground shrink-0">Text</Label>
            <input
              className="input-compact flex-1 min-w-0 font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text..."
              maxLength={30}
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Character</Label>
            <select value={charStyle} onChange={(e) => setCharStyle(e.target.value)} className="tool-select">
              <option value="block">█ Block</option>
              <option value="hash"># Hash</option>
              <option value="asterisk">* Asterisk</option>
              <option value="at">@ At</option>
              <option value="dollar">$ Dollar</option>
              <option value="plus">+ Plus</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground shrink-0">Spacing</Label>
            <select value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} className="tool-select">
              <option value={1}>Tight (1)</option>
              <option value={2}>Normal (2)</option>
              <option value={4}>Wide (4)</option>
            </select>
          </div>
        </div>

        <div className="tool-panel flex flex-col flex-1 min-h-0">
          <PanelHeader label="Output" text={output} />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CodeEditor
              value={output}
              readOnly
              language="text"
              placeholder="Type something above..."
              fillHeight
              showLineNumbers={false}
            />
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default AsciiArtPage;
