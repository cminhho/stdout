import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CopyButton from "@/components/CopyButton";
import { cn } from "@/utils/cn";
import { NUMBER_BASE_OPTIONS, NUMBER_BASE_PLACEHOLDER, parseFromBase, convertToAllBases } from "@/utils/numberBase";

const DEFAULT_TITLE = "Number Base";
const DEFAULT_DESCRIPTION = "Convert numbers between bases (bin, oct, dec, hex)";
const EMPTY_MESSAGE = "Enter a number.";
const BASE_BUTTON_SELECTED = "bg-primary text-primary-foreground";
const BASE_BUTTON_UNSELECTED = "bg-muted text-muted-foreground hover:text-foreground";

const NumberBasePage = () => {
  const tool = useCurrentTool();
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);

  const parsed = useMemo(() => parseFromBase(input, fromBase), [input, fromBase]);
  const results = useMemo(() => (parsed === null ? null : convertToAllBases(parsed)), [parsed]);

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? DEFAULT_TITLE}
      description={tool?.description ?? DEFAULT_DESCRIPTION}
      defaultInputPercent={30}
      inputPane={{
        title: "Input",
        children: (
          <div className="flex flex-col gap-2 p-2">
            <div className="text-xs text-muted-foreground">Enter a number and select source base. All conversions appear in the right panel.</div>
            <input
              className="input-compact w-full font-mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={NUMBER_BASE_PLACEHOLDER}
            />
            <div className="flex flex-wrap gap-1">
              {NUMBER_BASE_OPTIONS.map((b) => (
                <button
                  key={b.radix}
                  onClick={() => setFromBase(b.radix)}
                  className={cn("px-2 py-1 text-xs rounded transition-colors", fromBase === b.radix ? BASE_BUTTON_SELECTED : BASE_BUTTON_UNSELECTED)}
                >
                  {b.radix}
                </button>
              ))}
            </div>
          </div>
        ),
      }}
      outputPane={{
        title: "Conversions",
        children: (
          <div className="flex-1 min-h-0 overflow-auto mt-2 space-y-2">
            {results ? (
              results.map((r) => (
                <div key={r.radix} className="flex items-center justify-between gap-2 py-1 border-b border-border/50 last:border-0">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-muted-foreground">{r.label}</div>
                    <div className="text-xs font-mono text-foreground truncate">{r.value}</div>
                  </div>
                  <CopyButton text={r.value} />
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-2">{EMPTY_MESSAGE}</p>
            )}
          </div>
        ),
      }}
    />
  );
};

export default NumberBasePage;
