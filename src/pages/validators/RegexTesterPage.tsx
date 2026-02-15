import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import PanelHeader from "@/components/PanelHeader";
import CodeEditor from "@/components/CodeEditor";
import CopyButton from "@/components/CopyButton";

const FLAG_OPTIONS = [
  { flag: "g", label: "Global", desc: "Find all matches" },
  { flag: "i", label: "Case Insensitive", desc: "Ignore case" },
  { flag: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { flag: "s", label: "DotAll", desc: ". matches newlines" },
  { flag: "u", label: "Unicode", desc: "Enable Unicode support" },
];

const RegexTesterPage = () => {
  const tool = useCurrentTool();
  const [pattern, setPattern] = useState("(\\d{4})-(\\d{2})-(\\d{2})");
  const [flags, setFlags] = useState("gm");
  const [testString, setTestString] = useState("Order placed on 2024-01-15\nShipped on 2024-02-20\nDelivered 2024-03-01\nNo date here");

  const toggleFlag = (f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, "") : prev + f);
  };

  const result = useMemo(() => {
    if (!pattern || !testString) return null;
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups?: Record<string, string>; captures: string[] }[] = [];
      let m: RegExpExecArray | null;

      if (flags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.groups, captures: m.slice(1) });
          if (!m[0]) break;
        }
      } else {
        m = regex.exec(testString);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.groups, captures: m.slice(1) });
      }

      return { matches, error: null };
    } catch (e: any) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flags, testString]);

  const highlighted = useMemo(() => {
    if (!result || result.error || result.matches.length === 0 || !pattern) return null;
    try {
      const parts: { text: string; isMatch: boolean; matchIndex: number }[] = [];
      let lastIndex = 0;
      let matchIdx = 0;

      const allMatches: { index: number; end: number }[] = [];
      let m: RegExpExecArray | null;
      const r2 = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      while ((m = r2.exec(testString)) !== null) {
        allMatches.push({ index: m.index, end: m.index + m[0].length });
        if (!m[0]) break;
      }

      for (const match of allMatches) {
        if (match.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, match.index), isMatch: false, matchIndex: -1 });
        }
        parts.push({ text: testString.slice(match.index, match.end), isMatch: true, matchIndex: matchIdx++ });
        lastIndex = match.end;
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false, matchIndex: -1 });
      }
      return parts;
    } catch {
      return null;
    }
  }, [pattern, flags, testString, result]);

  return (
    <ToolLayout title={tool?.label ?? "Regex Tester"} description={tool?.description ?? "Test regular expressions with live matching"}>
      <div className="space-y-3">
        {/* Pattern & Flags */}
        <div className="tool-card space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Pattern</label>
              <div className="flex items-center rounded-md border bg-background border-border focus-within:ring-1 focus-within:ring-ring">
                <span className="text-muted-foreground text-sm pl-3 select-none">/</span>
                <input
                  className="flex-1 px-1 py-2 text-sm font-mono bg-transparent text-foreground focus:outline-none"
                  placeholder="e.g. (\\d+)-(\\w+)"
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
                  flags.includes(f.flag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {f.flag} <span className="font-sans text-[10px] opacity-70">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Test String */}
          <div className="tool-panel">
            <PanelHeader label="Test String" text={testString} onClear={() => setTestString("")} />
            <CodeEditor value={testString} onChange={setTestString} language="text" placeholder="Enter text to test against..." />
          </div>

          {/* Results */}
          <div className="tool-panel flex flex-col min-h-0">
            <PanelHeader label={`Matches${result && !result.error ? ` (${result.matches.length})` : ""}`} text={result?.matches.map(m => m.match).join("\n") ?? ""} />
            <div className="flex-1 min-h-0 flex flex-col mb-3">
              <CodeEditor
                value={result && !result.error ? result.matches.map(m => m.match).join("\n") : ""}
                readOnly
                language="text"
                placeholder="Matches will appear here..."
                fillHeight
              />
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              {result?.error && (
                <div className="tool-card border-destructive/50 text-destructive text-sm">⚠ {result.error}</div>
              )}

              {/* Highlighted preview */}
              {highlighted && (
                <div className="tool-card">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Highlighted</div>
                  <div className="code-block whitespace-pre-wrap text-xs leading-relaxed">
                    {highlighted.map((part, i) =>
                      part.isMatch ? (
                        <mark key={i} className="bg-primary/25 text-foreground rounded px-0.5 border border-primary/40">{part.text}</mark>
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Match details with capturing groups */}
              {result && !result.error && result.matches.length > 0 && (
                <div className="tool-card flex-1 overflow-auto">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Match Details</div>
                    <CopyButton text={result.matches.map((m) => m.match).join("\n")} />
                  </div>
                  <div className="space-y-2">
                    {result.matches.map((m, i) => (
                      <div key={i} className="rounded border border-border p-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-muted-foreground shrink-0">#{i + 1}</span>
                          <span className="text-primary font-medium">{JSON.stringify(m.match)}</span>
                          <span className="text-muted-foreground text-[10px]">@index {m.index}</span>
                        </div>
                        {m.captures.length > 0 && (
                          <div className="pl-4 space-y-0.5">
                            {m.captures.map((cap, ci) => (
                              <div key={ci} className="text-xs font-mono">
                                <span className="text-muted-foreground">Group {ci + 1}:</span>{" "}
                                <span className="text-accent-foreground">{JSON.stringify(cap)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {m.groups && Object.keys(m.groups).length > 0 && (
                          <div className="pl-4 space-y-0.5">
                            {Object.entries(m.groups).map(([name, val]) => (
                              <div key={name} className="text-xs font-mono">
                                <span className="text-muted-foreground">{name}:</span>{" "}
                                <span className="text-accent-foreground">{JSON.stringify(val)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && !result.error && result.matches.length === 0 && pattern && testString && (
                <div className="tool-card text-sm text-muted-foreground">No matches found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
};

export default RegexTesterPage;
