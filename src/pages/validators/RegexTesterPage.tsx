import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/layout/TwoPanelToolLayout";
import CodeEditor from "@/components/common/CodeEditor";
import ToolAlert from "@/components/common/ToolAlert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CopyButton from "@/components/common/CopyButton";

const SAMPLE_TEST_STRING = "Order placed on 2024-01-15\nShipped on 2024-02-20\nDelivered 2024-03-01\nNo date here";

const VALID_FLAGS = ["g", "i", "m", "s", "u"] as const;

/** Sanitize flags to valid set only, canonical order. Prevents invalid RegExp and keeps UI in sync. */
function sanitizeFlags(input: string): string {
  const seen = new Set<string>();
  let out = "";
  for (const f of VALID_FLAGS) {
    if (input.includes(f) && !seen.has(f)) {
      seen.add(f);
      out += f;
    }
  }
  return out;
}

const FLAG_OPTIONS: { flag: string; label: string; desc: string }[] = [
  { flag: "g", label: "Global", desc: "Find all matches" },
  { flag: "i", label: "Case Insensitive", desc: "Ignore case" },
  { flag: "m", label: "Multiline", desc: "^ and $ match line boundaries" },
  { flag: "s", label: "DotAll", desc: ". matches newlines" },
  { flag: "u", label: "Unicode", desc: "Enable Unicode support" },
];

const RegexTesterPage = () => {
  const [pattern, setPattern] = useState("(\\d{4})-(\\d{2})-(\\d{2})");
  const [flags, setFlags] = useState("gm");
  const [testString, setTestString] = useState(SAMPLE_TEST_STRING);

  const sanitizedFlags = useMemo(() => sanitizeFlags(flags), [flags]);

  const setFlagsSafe = (next: string | ((prev: string) => string)) => {
    setFlags((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      return sanitizeFlags(value);
    });
  };

  const toggleFlag = (f: string) => {
    setFlagsSafe((prev) => (prev.includes(f) ? prev.replace(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), "") : prev + f));
  };

  const result = useMemo(() => {
    if (!pattern.trim()) return null;
    try {
      const regex = new RegExp(pattern, sanitizedFlags);
      const matches: { match: string; index: number; groups?: Record<string, string>; captures: string[] }[] = [];
      let m: RegExpExecArray | null;

      if (sanitizedFlags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.groups, captures: m.slice(1) });
          if (m[0].length === 0) regex.lastIndex = m.index + 1;
        }
      } else {
        m = regex.exec(testString);
        if (m) matches.push({ match: m[0], index: m.index, groups: m.groups, captures: m.slice(1) });
      }

      return { matches, error: null };
    } catch (e: unknown) {
      return { matches: [], error: e instanceof Error ? e.message : String(e) };
    }
  }, [pattern, sanitizedFlags, testString]);

  const highlighted = useMemo(() => {
    if (!result || result.error || result.matches.length === 0 || !pattern.trim()) return null;
    try {
      const parts: { text: string; isMatch: boolean; matchIndex: number }[] = [];
      let lastIndex = 0;
      let matchIdx = 0;

      const allMatches: { index: number; end: number }[] = [];
      let m: RegExpExecArray | null;
      const flagsForExec = sanitizedFlags.includes("g") ? sanitizedFlags : sanitizedFlags + "g";
      const r2 = new RegExp(pattern, flagsForExec);
      while ((m = r2.exec(testString)) !== null) {
        allMatches.push({ index: m.index, end: m.index + m[0].length });
        if (m[0].length === 0) r2.lastIndex = m.index + 1;
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
  }, [pattern, sanitizedFlags, testString, result]);

  const matchesText = result && !result.error ? result.matches.map((m) => m.match).join("\n") : "";

  const topSection = (
    <section className="tool-section-card shrink-0" aria-label="Pattern and flags">
      <h2 className="home-section-label mb-0">Pattern & flags</h2>
      <div className="tool-top-form">
        <div className="tool-top-form-row">
          <div className="tool-top-form-field flex-1 min-w-0">
            <label className="tool-field-label shrink-0" htmlFor="regex-pattern-input">
              Pattern (use \\ for escapes, e.g. Java/JS)
            </label>
            <div className="flex items-center rounded-[var(--radius-button)] border border-border bg-background min-w-0 h-9 transition-colors duration-150 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
              <span className="text-muted-foreground text-sm pl-3 select-none" aria-hidden>/</span>
              <Input
                id="regex-pattern-input"
                className="flex-1 min-w-0 border-0 bg-transparent px-1 py-2 text-sm font-mono focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                placeholder="e.g. (\\d{4})-(\\d{2}) or \\d{4}-\\d{2}-\\d{2}"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                aria-label="Regular expression pattern"
              />
              <span className="text-muted-foreground text-sm pr-1 select-none" aria-hidden>/</span>
              <Input
                className="w-14 border-0 bg-transparent px-1 py-2 text-sm font-mono text-primary focus-visible:ring-0 focus-visible:ring-offset-0 h-9"
                placeholder="flags"
                value={flags}
                onChange={(e) => setFlagsSafe(e.target.value)}
                aria-label="Regex flags"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Regex flags">
          {FLAG_OPTIONS.map((f) => {
            const isOn = flags.includes(f.flag);
            return (
              <Button
                key={f.flag}
                type="button"
                size="xs"
                variant={isOn ? "default" : "outline"}
                onClick={() => toggleFlag(f.flag)}
                title={f.desc}
                className="cursor-pointer transition-colors duration-150 font-mono gap-1"
                aria-label={`${f.label}: ${f.desc}`}
                aria-pressed={isOn}
              >
                {f.flag} <span className="font-sans text-[10px] opacity-80">{f.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );

  const outputPaneContent = (
    <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-auto">
      <div className="flex-1 min-h-0 flex flex-col shrink-0">
        <CodeEditor
          value={matchesText}
          readOnly
          language="text"
          placeholder="Matches will appear here..."
          fillHeight
        />
      </div>
      {result?.error && <ToolAlert variant="error" message={result.error} />}

      {highlighted && (
        <div className="tool-section-card shrink-0">
          <h3 className="home-section-label mb-0">Highlighted</h3>
          <div className="code-block whitespace-pre-wrap text-[length:var(--text-ui)] leading-relaxed mt-2">
            {highlighted.map((part, i) =>
              part.isMatch ? (
                <mark key={i} className="bg-primary/25 text-foreground rounded px-0.5 border border-primary/40">
                  {part.text}
                </mark>
              ) : (
                <span key={i}>{part.text}</span>
              )
            )}
          </div>
        </div>
      )}

      {result && !result.error && result.matches.length > 0 && (
        <div className="tool-section-card flex-1 overflow-auto shrink-0 min-h-0">
          <div className="flex justify-between items-center gap-2 mb-2">
            <h3 className="home-section-label mb-0">Match Details</h3>
            <CopyButton text={result.matches.map((m) => m.match).join("\n")} className="shrink-0" />
          </div>
          <div className="space-y-2">
            {result.matches.map((m, i) => (
              <div
                key={i}
                className="rounded-[var(--home-radius-card)] border border-border p-2.5 space-y-1 transition-colors duration-150"
              >
                <div className="flex items-center gap-2 text-[length:var(--text-ui)] font-mono flex-wrap">
                  <span className="text-muted-foreground shrink-0">#{i + 1}</span>
                  <span className="text-primary font-medium break-all">{JSON.stringify(m.match)}</span>
                  <span className="text-muted-foreground text-[length:var(--text-caption)]">@index {m.index}</span>
                </div>
                {m.captures.length > 0 && (
                  <div className="pl-4 space-y-0.5">
                    {m.captures.map((cap, ci) => (
                      <div key={ci} className="text-[length:var(--text-ui)] font-mono">
                        <span className="text-muted-foreground">Group {ci + 1}:</span>{" "}
                        <span className="text-foreground">{JSON.stringify(cap)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {m.groups && Object.keys(m.groups).length > 0 && (
                  <div className="pl-4 space-y-0.5">
                    {Object.entries(m.groups).map(([name, val]) => (
                      <div key={name} className="text-[length:var(--text-ui)] font-mono">
                        <span className="text-muted-foreground">{name}:</span>{" "}
                        <span className="text-foreground">{JSON.stringify(val)}</span>
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
        <div className="tool-section-card text-[length:var(--text-content)] text-muted-foreground shrink-0">
          No matches found
        </div>
      )}
    </div>
  );

  return (
    <TwoPanelToolLayout
      topSection={topSection}
      inputPane={{
        title: "Test String",
        inputToolbar: {
          onSample: () => setTestString(SAMPLE_TEST_STRING),
          setInput: setTestString,
          fileAccept: ".txt,text/plain",
          onFileText: setTestString,
        },
        inputEditor: {
          value: testString,
          onChange: setTestString,
          language: "text",
          placeholder: "Enter text to test against...",
        },
      }}
      outputPane={{
        title: result && !result.error ? `Matches (${result.matches.length})` : "Matches",
        copyText: matchesText || undefined,
        children: outputPaneContent,
      }}
    />
  );
};

export default RegexTesterPage;
