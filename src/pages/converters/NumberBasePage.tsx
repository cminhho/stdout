import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolPane from "@/components/ToolPane";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CopyButton from "@/components/CopyButton";
import { ClearButton } from "@/components/ClearButton";
import { NUMBER_BASE_OPTIONS, NUMBER_BASE_PLACEHOLDER, parseFromBase, convertToAllBases } from "@/utils/numberBase";

const DEFAULT_TITLE = "Number Base";
const DEFAULT_DESCRIPTION = "Convert numbers between bases (bin, oct, dec, hex)";
const EMPTY_MESSAGE = "Enter a number.";

const NumberBasePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);

  const parsed = useMemo(() => parseFromBase(input, fromBase), [input, fromBase]);
  const results = useMemo(() => (parsed === null ? null : convertToAllBases(parsed)), [parsed]);

  const pane = {
    title: tool?.label ?? DEFAULT_TITLE,
    toolbar: input ? <ClearButton onClick={() => setInput("")} /> : undefined,
    children: (
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
        <section
          className="space-y-3 rounded-xl border border-border/60 bg-muted/25 px-4 py-3 shadow-sm shrink-0"
          aria-label="Input"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Convert
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter a number and select source base. All conversions appear below.
          </p>
          <div className="space-y-2">
            <Label htmlFor="number-base-input" variant="muted" className="text-xs sr-only">
              Number
            </Label>
            <Input
              id="number-base-input"
              className="input-compact w-full font-mono h-8"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={NUMBER_BASE_PLACEHOLDER}
              aria-label="Number to convert"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">Source base</span>
            {NUMBER_BASE_OPTIONS.map((b) => (
              <Button
                key={b.radix}
                type="button"
                size="xs"
                variant={fromBase === b.radix ? "default" : "outline"}
                onClick={() => setFromBase(b.radix)}
                className="min-h-touch font-mono"
                aria-label={b.label}
                aria-pressed={fromBase === b.radix}
              >
                {b.radix}
              </Button>
            ))}
          </div>
        </section>

        <section
          className="flex-1 min-h-0 flex flex-col rounded-xl border border-border/60 bg-muted/25 overflow-hidden shadow-sm"
          aria-label="Results"
        >
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0 px-4 pt-3 pb-2">
            Conversions
          </h2>
          <div className="flex-1 min-h-0 overflow-auto px-4 pb-4 space-y-0 border-t border-border/60">
            {results ? (
              <ul className="divide-y divide-border/50 pt-2" aria-label="Converted values by base">
                {results.map((r) => (
                  <li
                    key={r.radix}
                    className="flex items-center justify-between gap-2 py-2 min-h-touch first:pt-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-muted-foreground">{r.label}</div>
                      <div className="text-xs font-mono text-foreground truncate">{r.value}</div>
                    </div>
                    <CopyButton text={r.value} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground py-3">{EMPTY_MESSAGE}</p>
            )}
          </div>
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout title={tool?.label ?? DEFAULT_TITLE} description={tool?.description ?? DEFAULT_DESCRIPTION}>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl mx-auto">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default NumberBasePage;
