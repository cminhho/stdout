import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import { FileCode, Eraser } from "lucide-react";

const SAMPLE_TEXT = "HELLO";

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
  const [input, setInput] = useState(SAMPLE_TEXT);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Text"
            extra={
              <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput(SAMPLE_TEXT)}>
                  <FileCode className="h-3.5 w-3.5 mr-1.5" />
                  Sample
                </Button>
                <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setInput("")}>
                  <Eraser className="h-3.5 w-3.5 mr-1.5" />
                  Clear
                </Button>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col">
            <CodeEditor
              value={input}
              onChange={setInput}
              language="text"
              placeholder="Enter text..."
              fillHeight
              showLineNumbers={false}
            />
          </div>
        </div>
        <div className="tool-panel flex flex-col min-h-0">
          <PanelHeader
            label="Output"
            text={output}
            extra={
              <div className="flex items-center gap-2 flex-wrap">
                <select value={charStyle} onChange={(e) => setCharStyle(e.target.value)} className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0">
                  <option value="block">█ Block</option>
                  <option value="hash"># Hash</option>
                  <option value="asterisk">* Asterisk</option>
                  <option value="at">@ At</option>
                  <option value="dollar">$ Dollar</option>
                  <option value="plus">+ Plus</option>
                </select>
                <select value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} className="h-7 rounded border border-input bg-background pl-2 pr-6 text-xs min-w-0">
                  <option value={1}>Tight</option>
                  <option value={2}>Normal</option>
                  <option value={4}>Wide</option>
                </select>
              </div>
            }
          />
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CodeEditor
              value={output}
              readOnly
              language="text"
              placeholder="Type in the left panel..."
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
