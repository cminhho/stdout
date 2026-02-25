import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolPane from "@/components/ToolPane";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectWithOptions } from "@/components/ui/select";
import CopyButton from "@/components/CopyButton";
import { ClearButton } from "@/components/ClearButton";
import { CSS_UNITS_LIST, CSS_UNITS_DEFAULT_BASE, convertToAllUnits } from "@/utils/cssUnits";

const DEFAULT_TITLE = "CSS Units";
const DEFAULT_DESCRIPTION = "Convert between CSS units (px, rem, em, vw, vh, etc.)";

const CssUnitsPage = () => {
  const [value, setValue] = useState("16");
  const [fromUnit, setFromUnit] = useState("px");
  const [baseFontSize, setBaseFontSize] = useState(String(CSS_UNITS_DEFAULT_BASE));

  const numVal = parseFloat(value) || 0;
  const baseNum = parseFloat(baseFontSize) || CSS_UNITS_DEFAULT_BASE;
  const viewport = useMemo(() => ({ width: window.innerWidth, height: window.innerHeight }), []);
  const results = useMemo(
    () => convertToAllUnits(numVal, fromUnit, baseNum, viewport),
    [numVal, fromUnit, baseNum, viewport]
  );

  const isDefault =
    value === "16" && fromUnit === "px" && baseFontSize === String(CSS_UNITS_DEFAULT_BASE);

  const resetToDefault = () => {
    setValue("16");
    setFromUnit("px");
    setBaseFontSize(String(CSS_UNITS_DEFAULT_BASE));
  };

  const unitOptions = CSS_UNITS_LIST.map((u) => ({ value: u, label: u }));

  const pane = {
    title: DEFAULT_TITLE,
    toolbar: !isDefault ? <ClearButton onClick={resetToDefault} /> : undefined,
    children: (
      <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-hidden">
        <section className="space-y-3 shrink-0" aria-label="Input">
          <p className="text-xs text-muted-foreground">
            Enter a value and source unit. Base font-size is used for rem/em. Results update live.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="css-units-value" className="text-xs text-muted-foreground">
                Value
              </Label>
              <Input
                id="css-units-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-28 h-7 font-mono text-xs"
                aria-label="Numeric value"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="css-units-from" className="text-xs text-muted-foreground">
                From unit
              </Label>
              <SelectWithOptions
                size="xs"
                variant="secondary"
                value={fromUnit}
                onValueChange={setFromUnit}
                options={unitOptions}
                title="From unit"
                aria-label="From unit"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="css-units-base" className="text-xs text-muted-foreground">
                Base font-size (px)
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="css-units-base"
                  type="number"
                  min={1}
                  value={baseFontSize}
                  onChange={(e) => setBaseFontSize(e.target.value || String(CSS_UNITS_DEFAULT_BASE))}
                  className="w-16 h-7 font-mono text-xs"
                  aria-label="Base font size in pixels"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 min-h-0 flex flex-col" aria-label="Conversions">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider shrink-0 mb-2">
            Conversions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-auto min-h-0">
            {results.map((r) => (
              <div
                key={r.unit}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="font-mono text-sm font-medium truncate">{r.value}</div>
                  <div className="text-xs text-muted-foreground">{r.unit}</div>
                </div>
                <CopyButton text={`${r.value}${r.unit}`} />
              </div>
            ))}
          </div>
        </section>
      </div>
    ),
  };

  return (
    <ToolLayout>
      <div className="flex flex-col flex-1 min-h-0 w-full tool-content-stack max-w-3xl">
        <ToolPane pane={pane} />
      </div>
    </ToolLayout>
  );
};

export default CssUnitsPage;
