import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { Button } from "@/components/ui/button";
import { useCurrentTool } from "@/hooks/useCurrentTool";

const SAMPLE_INPUT = "hello world example";
const TRANSFORM_NAMES = [
  "camelCase",
  "PascalCase",
  "snake_case",
  "SCREAMING_SNAKE",
  "kebab-case",
  "dot.case",
  "Title Case",
  "UPPERCASE",
  "lowercase",
  "Reverse",
  "Slug",
  "Trim Lines",
  "Remove Empty Lines",
  "Sort Lines (A-Z)",
  "Unique Lines",
  "Escape Quotes",
  "Unescape Quotes",
] as const;

const transforms: Record<string, (s: string) => string> = {
  "camelCase": (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^[A-Z]/, (c) => c.toLowerCase()),
  "PascalCase": (s) => s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^[a-z]/, (c) => c.toUpperCase()),
  "snake_case": (s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toLowerCase(),
  "SCREAMING_SNAKE": (s) => s.replace(/([a-z])([A-Z])/g, "$1_$2").replace(/[-\s]+/g, "_").toUpperCase(),
  "kebab-case": (s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/[_\s]+/g, "-").toLowerCase(),
  "dot.case": (s) => s.replace(/([a-z])([A-Z])/g, "$1.$2").replace(/[-_\s]+/g, ".").toLowerCase(),
  "Title Case": (s) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()),
  "UPPERCASE": (s) => s.toUpperCase(),
  "lowercase": (s) => s.toLowerCase(),
  "Reverse": (s) => s.split("").reverse().join(""),
  "Slug": (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  "Trim Lines": (s) => s.split("\n").map((l) => l.trim()).join("\n"),
  "Remove Empty Lines": (s) => s.split("\n").filter((l) => l.trim()).join("\n"),
  "Sort Lines (A-Z)": (s) => s.split("\n").sort().join("\n"),
  "Unique Lines": (s) => [...new Set(s.split("\n"))].join("\n"),
  "Escape Quotes": (s) => s.replace(/"/g, '\\"').replace(/'/g, "\\'"),
  "Unescape Quotes": (s) => s.replace(/\\"/g, '"').replace(/\\'/g, "'"),
};

const StringTransformerPage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<(typeof TRANSFORM_NAMES)[number]>("camelCase");

  const output = useMemo(() => {
    if (!input) return "";
    return transforms[selected]?.(input) ?? input;
  }, [input, selected]);

  return (
    <TwoPanelToolLayout
      tool={tool}
      inputPane={{
        inputToolbar: {
          onSample: () => setInput(SAMPLE_INPUT),
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
        title: `Result (${selected})`,
        copyText: output || undefined,
        toolbar: (
          <div
            role="group"
            aria-label="Transform type"
            className="flex flex-wrap gap-1.5 rounded-lg border border-input bg-muted/50 p-1"
          >
            {TRANSFORM_NAMES.map((name) => (
              <Button
                key={name}
                type="button"
                variant={selected === name ? "default" : "ghost"}
                size="xs"
                className="min-w-0 font-mono"
                aria-pressed={selected === name}
                onClick={() => setSelected(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        ),
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
