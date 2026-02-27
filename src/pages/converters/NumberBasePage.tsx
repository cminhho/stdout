import { useState, useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import { SampleButton } from "@/components/common/SampleButton";
import { NUMBER_BASE_OPTIONS, NUMBER_BASE_PLACEHOLDER, parseFromBase, convertToAllBases } from "@/utils/numberBase";

const EMPTY_MESSAGE = "Enter a number.";
const SAMPLE_BASE = 10;
const SAMPLE_MIN = 1;
const SAMPLE_MAX = 65535;

function getRandomSample(): string {
  const n = Math.floor(Math.random() * (SAMPLE_MAX - SAMPLE_MIN + 1)) + SAMPLE_MIN;
  return String(n);
}

const NumberBasePage = () => {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);

  const parsed = useMemo(() => parseFromBase(input, fromBase), [input, fromBase]);
  const results = useMemo(() => (parsed === null ? null : convertToAllBases(parsed)), [parsed]);

  const copyAllText =
    results?.map((r) => `${r.label}: ${r.value}`).join("\n") ?? undefined;

  const pane = {
    title: "Number Base",
    copyText: copyAllText,
    toolbar: (
      <div className="toolbar-actions-row">
        <SampleButton
          onClick={() => {
            setInput(getRandomSample());
            setFromBase(SAMPLE_BASE);
          }}
        />
        {input ? <ClearButton onClick={() => setInput("")} /> : null}
      </div>
    ),
    children: (
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-hidden">
        <section className="tool-section-card shrink-0 space-y-4" aria-label="Convert">
          <h2 className="home-section-label mb-0">Convert</h2>
          <p className="tool-caption leading-relaxed text-muted-foreground">
            Enter a number and select source base. All conversions appear below.
          </p>
          <div className="space-y-1.5">
            <Label htmlFor="number-base-input" className="tool-field-label">
              Number
            </Label>
            <Input
              id="number-base-input"
              className="w-full font-mono h-9 rounded-[var(--radius-button)] text-[length:var(--text-ui)] transition-colors duration-150"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={NUMBER_BASE_PLACEHOLDER}
              aria-label="Number to convert"
            />
          </div>
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Source base"
          >
            <span className="tool-caption shrink-0">Source base</span>
            {NUMBER_BASE_OPTIONS.map((b) => (
              <Button
                key={b.radix}
                type="button"
                size="xs"
                variant={fromBase === b.radix ? "default" : "outline"}
                onClick={() => setFromBase(b.radix)}
                className="min-h-touch sm:min-h-0 font-mono cursor-pointer transition-colors duration-150"
                aria-label={b.label}
                aria-pressed={fromBase === b.radix}
              >
                {b.radix}
              </Button>
            ))}
          </div>
        </section>

        <section
          className="tool-section-card tool-section-card--fill flex-1 min-h-0 flex flex-col overflow-hidden"
          aria-label="Conversions"
        >
          <h2 className="home-section-label mb-0 px-[var(--spacing-panel-inner-x)] pt-[var(--spacing-panel-inner-y)] pb-2">
            Conversions
          </h2>
          <div className="flex-1 min-h-0 overflow-auto px-[var(--spacing-panel-inner-x)] pb-[var(--spacing-panel-inner-y)] border-t border-border">
            {results ? (
              <ul className="divide-y divide-border/50 pt-2" aria-label="Converted values by base">
                {results.map((r) => (
                  <li
                    key={r.radix}
                    className="flex items-center justify-between gap-2 py-2 min-h-touch sm:min-h-0 first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[length:var(--text-ui)] text-muted-foreground">{r.label}</div>
                      <div className="font-mono text-foreground text-[length:var(--text-ui)] truncate" title={r.value}>
                        {r.value}
                      </div>
                    </div>
                    <CopyButton text={r.value} className="shrink-0" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="tool-caption py-4 leading-relaxed text-muted-foreground" role="status">
                {EMPTY_MESSAGE}
              </p>
            )}
          </div>
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl mx-auto">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default NumberBasePage;
