import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/CopyButton";
import { FileCode, Eraser } from "lucide-react";

const SAMPLE_TEST_STRING = "Order 2024-01-15\nShipped 2024-02-20";

const FLAG_OPTIONS = [
  { flag: "g", label: "Global", desc: "Find all matches" },
  { flag: "i", label: "Case Insensitive", desc: "Ignore case" },
  { flag: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { flag: "s", label: "DotAll", desc: ". matches newlines" },
  { flag: "u", label: "Unicode", desc: "Enable Unicode support" },
];

const JavaRegexTesterPage = () => {
  const tool = useCurrentTool();
  const [pattern, setPattern] = useState("\\d{4}-\\d{2}-\\d{2}");
  const [flags, setFlags] = useState("gm");
  const [testString, setTestString] = useState(SAMPLE_TEST_STRING);

  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, "") : prev + f);
  };

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; captures: string[] }[] = [];
      let m: RegExpExecArray | null;
      if (flags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, captures: m.slice(1) });
          if (!m[0]) break;
        }
      } else {
        m = regex.exec(testString);
        if (m) matches.push({ match: m[0], index: m.index, captures: m.slice(1) });
      }
      return { matches, error: null };
    } catch (e: unknown) {
      return { matches: [], error: (e as Error).message };
    }
  }, [pattern, flags, testString]);

  return (
    <ToolLayout title={tool?.label ?? "Java Regex Tester"} description={tool?.description ?? "Test Java-style regular expressions"}>
      <div className="space-y-3">
        <div className="tool-card space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Pattern (Java-style, use \\ for escapes)</label>
              <div className="flex items-center rounded-md border bg-background border-border focus-within:ring-1 focus-within:ring-ring">
                <span className="text-muted-foreground text-sm pl-3 select-none">/</span>
                <input
                  className="flex-1 px-1 py-2 text-sm font-mono bg-transparent text-foreground focus:outline-none"
                  placeholder="e.g. \\d{4}-\\d{2}-\\d{2}"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                />
                <span className="text-muted-foreground text-sm pr-1 select-none">/</span>
                <input
                  className="w-14 px-1 py-2 text-sm font-mono bg-transparent text-primary focus:outline-none"
                  placeholder="flags"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FLAG_OPTIONS.map((f) => (
              <button
                key={f.flag}
                onClick={() => toggleFlag(f.flag)}
                title={f.desc}
                className={`px-2 py-1 text-xs rounded border transition-colors font-mono ${
                  flags.includes(f.flag) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f.flag} <span className="font-sans text-[10px] opacity-70">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="tool-panel flex flex-col min-h-0">
            <PanelHeader
              label="Test String"
              extra={
                <div className="flex items-center gap-2">
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setTestString(SAMPLE_TEST_STRING)}>
                    <FileCode className="h-3.5 w-3.5 mr-1.5" />
                    Sample
                  </Button>
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setTestString("")}>
                    <Eraser className="h-3.5 w-3.5 mr-1.5" />
                    Clear
                  </Button>
                </div>
              }
            />
            <div className="flex-1 min-h-0 flex flex-col">
              <CodeEditor value={testString} onChange={setTestString} language="text" placeholder="Enter text to test against..." fillHeight />
            </div>
          </div>
          <div className="tool-panel flex flex-col min-h-0">
            <PanelHeader label={`Matches${result && !result.error ? ` (${result.matches.length})` : ""}`} text={result?.matches.map((m) => m.match).join("\n") ?? ""} />
            <div className="flex-1 min-h-0 flex flex-col mb-3">
              <CodeEditor
                value={result && !result.error ? result.matches.map((m) => m.match).join("\n") : ""}
                readOnly
                language="text"
                placeholder="Matches will appear here..."
                fillHeight
              />
            </div>
            {result?.error && <div className="text-sm text-destructive">⚠ {result.error}</div>}
            {result && !result.error && result.matches.length > 0 && (
              <div className="mt-2 space-y-2">
                <CopyButton text={result.matches.map((m) => m.match).join("\n")} />
                {result.matches.map((m, i) => (
                  <div key={i} className="rounded border border-border p-2 text-xs font-mono">
                    #{i + 1} {JSON.stringify(m.match)} @{m.index}
                    {m.captures.length > 0 && ` [${m.captures.map((c) => JSON.stringify(c)).join(", ")}]`}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default JavaRegexTesterPage;
