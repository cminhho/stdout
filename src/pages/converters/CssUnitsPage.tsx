import { useState, useMemo } from "react";
import ToolLayout from "@/components/layout/ToolLayout";
import ToolPane from "@/components/layout/ToolPane";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectWithOptions } from "@/components/ui/select";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import { CSS_UNITS_LIST, CSS_UNITS_DEFAULT_BASE, convertToAllUnits } from "@/utils/cssUnits";

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
    title: "CSS Units",
    toolbar: !isDefault ? (
      <div className="toolbar-actions-row">
        <ClearButton onClick={resetToDefault} />
      </div>
    ) : undefined,
    children: (
      <div className="flex flex-col gap-[var(--home-content-gap)] flex-1 min-h-0 overflow-auto">
        <section className="tool-section-card shrink-0 space-y-4" aria-label="Input">
          <h2 className="home-section-label mb-0">Input</h2>
          <p className="tool-caption text-muted-foreground leading-relaxed">
            Enter a value and source unit. Base font-size is used for rem/em. Results update live.
          </p>
          <div className="flex flex-wrap items-end gap-6">
            <div className="space-y-1.5">
              <Label htmlFor="css-units-value" className="tool-field-label">
                Value
              </Label>
              <Input
                id="css-units-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-28 h-9 font-mono text-[length:var(--text-ui)] rounded-[var(--radius-button)] transition-colors duration-150"
                aria-label="Numeric value"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="css-units-from" className="tool-field-label">
                From unit
              </Label>
              <SelectWithOptions
                variant="secondary"
                value={fromUnit}
                onValueChange={setFromUnit}
                options={unitOptions}
                title="From unit"
                aria-label="From unit"
                triggerClassName="cursor-pointer min-h-touch sm:min-h-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="css-units-base" className="tool-field-label">
                Base font-size (px)
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  id="css-units-base"
                  type="number"
                  min={1}
                  value={baseFontSize}
                  onChange={(e) => setBaseFontSize(e.target.value || String(CSS_UNITS_DEFAULT_BASE))}
                  className="w-16 h-9 font-mono text-[length:var(--text-ui)] rounded-[var(--radius-button)] transition-colors duration-150"
                  aria-label="Base font size in pixels"
                />
                <span className="tool-caption">px</span>
              </div>
            </div>
          </div>
        </section>

        <section className="tool-section-card flex-1 min-h-0 flex flex-col overflow-hidden" aria-label="Conversions">
          <h2 className="home-section-label mb-0">Conversions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-auto min-h-0 mt-2">
            {results.map((r) => (
              <div
                key={r.unit}
                className="flex items-center justify-between gap-2 rounded-[var(--home-radius-card)] border border-border bg-muted/30 dark:bg-muted/20 px-3 py-2 min-h-touch sm:min-h-0 transition-colors duration-150"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[length:var(--text-ui)] font-medium text-foreground truncate" title={`${r.value}${r.unit}`}>
                    {r.value}
                  </div>
                  <div className="tool-caption">{r.unit}</div>
                </div>
                <CopyButton text={`${r.value}${r.unit}`} className="shrink-0" />
              </div>
            ))}
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

export default CssUnitsPage;
