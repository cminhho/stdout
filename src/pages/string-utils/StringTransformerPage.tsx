import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";

function getSampleInput(): string {
  return [
    "responsePayloadValidatorId",
    "API_RATE_LIMITER",
    "user_session_metadata",
    "CachedSearchResult",
    "fetch-user-preferences",
    "The quick brown fox jumps.",
    "A line with symbols 🎯 and spéciål çhars",
  ].join("\n");
}

// One choice per group; pipeline = convert case → sort line → other
const TRANSFORM_GROUPS: { label: string; names: readonly string[] }[] = [
  {
    label: "Convert case",
    names: ["lowercase", "UPPERCASE", "Title Case", "camelCase", "PascalCase", "snake_case", "SCREAMING_SNAKE", "kebab-case"],
  },
  {
    label: "Sort line",
    names: ["Trim Lines", "Remove Empty Lines", "Add Line Numbers", "Remove Line Numbers", "Sort Lines (A-Z)", "Sort Lines (Z-A)", "Unique Lines", "List cleanup"],
  },
  {
    label: "Other",
    names: ["Normalize Whitespace", "Slug", "JSON Escape", "JSON Unescape"],
  },
];

const TRANSFORM_NAMES = TRANSFORM_GROUPS.flatMap((g) => g.names);

/** Apply a single-line transform to each line; preserves line breaks (no formatting). */
const perLine = (fn: (line: string) => string) => (s: string) =>
  s.split("\n").map(fn).join("\n");

const transforms: Record<string, (s: string) => string> = {
  "camelCase": perLine((s) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^[A-Z]/, (c) => c.toLowerCase())),
  "PascalCase": perLine((s) => s.replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : "")).replace(/^[a-z]/, (c) => c.toUpperCase())),
  "snake_case": perLine((s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase()),
  "SCREAMING_SNAKE": perLine((s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toUpperCase()),
  "kebab-case": perLine((s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase()),
  "Title Case": perLine((s) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())),
  "UPPERCASE": perLine((s) => s.toUpperCase()),
  "lowercase": perLine((s) => s.toLowerCase()),
  "Slug": perLine((s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")),
  "Trim Lines": (s) => s.split("\n").map((l) => l.trim()).join("\n"),
  "Remove Empty Lines": (s) => s.split("\n").filter((l) => l.trim()).join("\n"),
  "Add Line Numbers": (s) => s.split("\n").map((line, i) => `${i + 1}. ${line}`).join("\n"),
  "Remove Line Numbers": (s) => s.split("\n").map((l) => l.replace(/^\s*\d+[.):\s]+/, "").trim()).join("\n"),
  "Sort Lines (A-Z)": (s) => s.split("\n").sort().join("\n"),
  "Sort Lines (Z-A)": (s) => s.split("\n").sort((a, b) => b.localeCompare(a)).join("\n"),
  "Unique Lines": (s) => [...new Set(s.split("\n"))].join("\n"),
  "List cleanup": (s) => {
    const lines = s.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    return [...new Set(lines)].sort().join("\n");
  },
  "Normalize Whitespace": (s) =>
    s.split("\n").map((l) => l.trim().replace(/\s+/g, " ")).filter((l) => l.length > 0).join("\n"),
  "JSON Escape": (s) => JSON.stringify(s).slice(1, -1),
  "JSON Unescape": (s) => {
    const wrapped = `"${s.replace(/\n/g, "\\n").replace(/\r/g, "\\r")}"`;
    try {
      return JSON.parse(wrapped);
    } catch {
      return s.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
    }
  },
};

const StringTransformerPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [input, setInput] = useState("");
  // One selection per group (by group index); pipeline order = group order
  const [selectedByGroup, setSelectedByGroup] = useState<(string | null)[]>(["camelCase", null, null]);

  useEffect(() => {
    if (searchParams.get("mode") === "list" && TRANSFORM_NAMES.includes("List cleanup")) {
      setSelectedByGroup([null, "List cleanup", null]);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const selectInGroup = (groupIndex: number, name: string) => {
    setSelectedByGroup((prev) => {
      const next = [...prev];
      next[groupIndex] = prev[groupIndex] === name ? null : name;
      return next;
    });
  };

  const pipeline = selectedByGroup.filter((s): s is string => s != null);
  const output = useMemo(() => {
    if (!input) return "";
    if (pipeline.length === 0) return input;
    return pipeline.reduce((acc, name) => transforms[name]?.(acc) ?? acc, input);
  }, [input, pipeline]);

  const title =
    pipeline.length === 0 ? "Result" : pipeline.length === 1 ? `Result (${pipeline[0]})` : `Result (${pipeline.join(" → ")})`;

  const transformToolbar = (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      {TRANSFORM_GROUPS.map((group, groupIndex) => (
        <div key={group.label} className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0">
            {group.label}
          </span>
          <div
            role="group"
            aria-label={group.label}
            className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-muted/50 p-1"
          >
            {group.names.map((name) => {
              const selected = selectedByGroup[groupIndex] === name;
              return (
                <Button
                  key={name}
                  type="button"
                  variant={selected ? "default" : "ghost"}
                  size="xs"
                  className="min-w-0 font-mono"
                  aria-pressed={selected}
                  onClick={() => selectInGroup(groupIndex, name)}
                >
                  {name}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <TwoPanelToolLayout
      topSection={transformToolbar}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(getSampleInput()),
          setInput,
          fileAccept: ".txt,text/plain",
          onFileText: setInput,
        },
        inputEditor: {
          value: input,
          onChange: setInput,
          language: "text",
          placeholder: "Enter text to transform...",
        },
      }}
      outputPane={{
        title,
        copyText: output || undefined,
        outputEditor: {
          value: output,
          language: "text",
          placeholder: "Result will appear here...",
        },
      }}
    />
  );
};

export default StringTransformerPage;
