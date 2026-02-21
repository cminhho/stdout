import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog.\nSecond line here.\nThird line.";

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab";

const toTitleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
const toSentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const toCamelCase = (s: string) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""));
const toSnakeCase = (s: string) => s.replace(/[\s-]+/g, "_").replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
const toKebabCase = (s: string) => s.replace(/[\s_]+/g, "-").replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const convertCase = (text: string, type: CaseType): string => {
  switch (type) {
    case "upper": return text.toUpperCase();
    case "lower": return text.toLowerCase();
    case "title": return toTitleCase(text);
    case "sentence": return text.split(". ").map(toSentenceCase).join(". ");
    case "camel": return toCamelCase(text);
    case "snake": return toSnakeCase(text);
    case "kebab": return toKebabCase(text);
  }
};

const TextAnalyzerPage = () => {
  const tool = useCurrentTool();
  const [text, setText] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [regexFlags, setRegexFlags] = useState("g");

  const stats = useMemo(() => {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(Boolean).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\n+/).filter(Boolean).length : 0;
    return { chars, words, lines, sentences, paragraphs };
  }, [text]);

  const regexMatches = useMemo(() => {
    if (!regexPattern || !text) return [];
    try {
      const re = new RegExp(regexPattern, regexFlags);
      return [...text.matchAll(re)].map((m) => ({
        match: m[0],
        index: m.index ?? 0,
        groups: m.slice(1),
      }));
    } catch {
      return [];
    }
  }, [text, regexPattern, regexFlags]);

  const sortLines = () => setText(text.split("\n").sort().join("\n"));
  const removeDuplicateLines = () => setText([...new Set(text.split("\n"))].join("\n"));
  const reverseLines = () => setText(text.split("\n").reverse().join("\n"));
  const applyCase = (type: CaseType) => setText(convertCase(text, type));

  return (
    <TwoPanelToolLayout
      tool={tool}
      topSection={
        <div className="flex flex-col gap-2">
          {text.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(stats).map(([key, val]) => (
                <span key={key} className="px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                  {key}: <span className="font-mono font-medium text-foreground">{val}</span>
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={sortLines}>Sort Lines</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={removeDuplicateLines}>Remove Dupes</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={reverseLines}>Reverse</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => applyCase("upper")}>UPPER</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => applyCase("lower")}>lower</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => applyCase("title")}>Title</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => applyCase("camel")}>camelCase</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => applyCase("snake")}>snake_case</Button>
            <Button size="xs" variant="outline" className="h-7 text-xs" onClick={() => applyCase("kebab")}>kebab-case</Button>
            <div className="flex items-center gap-1.5 ml-1">
              <Label className="text-xs text-muted-foreground shrink-0">Regex</Label>
              <Input
                className="h-7 w-32 font-mono text-xs min-w-0"
                placeholder="Pattern..."
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
              />
              <Input
                className="h-7 w-12 font-mono text-xs text-center min-w-0"
                placeholder="Flags"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
              />
              {regexPattern && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {regexMatches.length} match{regexMatches.length !== 1 ? "es" : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      }
      inputPane={{
        inputToolbar: {
          onSample: () => setText(SAMPLE_TEXT),
          setInput: setText,
          fileAccept: ".txt,text/plain",
          onFileText: setText,
        },
        inputEditor: {
          value: text,
          onChange: setText,
          language: "text",
          placeholder: "Paste your text here...",
        },
      }}
      outputPane={{
        title: "Stats & Regex",
        copyText: regexMatches.length > 0 ? regexMatches.map((m) => m.match).join("\n") : undefined,
        children: (
          <div className="flex-1 min-h-0 overflow-auto space-y-3">
            {regexMatches.length === 0 && (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                Enter text to see stats above; add a regex to see matches here.
              </div>
            )}
            {regexMatches.length > 0 && (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Regex Matches</div>
                <div className="code-block space-y-1 max-h-[50vh] overflow-y-auto">
                  {regexMatches.slice(0, 50).map((m, i) => (
                    <div key={i}>
                      <span className="text-primary">{m.match}</span>
                      <span className="text-muted-foreground"> at index {m.index}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      }}
    />
  );
};

export default TextAnalyzerPage;
