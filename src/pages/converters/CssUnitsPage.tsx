import { useState, useMemo } from "react";
import TwoPanelToolLayout from "@/components/TwoPanelToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CopyButton from "@/components/CopyButton";
import { CSS_UNITS_LIST, CSS_UNITS_DEFAULT_BASE, convertToAllUnits } from "@/utils/cssUnits";

const DEFAULT_TITLE = "CSS Units";
const DEFAULT_DESCRIPTION = "Convert between CSS units (px, rem, em, vw)";

const CssUnitsPage = () => {
  const tool = useCurrentTool();
  const [value, setValue] = useState("16");
  const [fromUnit, setFromUnit] = useState("px");
  const [baseFontSize, setBaseFontSize] = useState(CSS_UNITS_DEFAULT_BASE);

  const numVal = parseFloat(value) || 0;
  const viewport = useMemo(() => ({ width: window.innerWidth, height: window.innerHeight }), []);
  const results = useMemo(
    () => convertToAllUnits(numVal, fromUnit, baseFontSize, viewport),
    [numVal, fromUnit, baseFontSize, viewport]
  );

  const topSection = (
    <div className="tool-card space-y-3 max-w-2xl">
      <div className="flex gap-3 items-end flex-wrap">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Value</label>
          <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="input-compact w-28" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">From</label>
          <SelectWithOptions
            size="xs"
            variant="secondary"
            value={fromUnit}
            onValueChange={setFromUnit}
            options={CSS_UNITS_LIST}
            title="From unit"
            aria-label="From unit"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Base font-size</label>
          <input
            type="number"
            value={baseFontSize}
            onChange={(e) => setBaseFontSize(Number(e.target.value) || CSS_UNITS_DEFAULT_BASE)}
            className="input-compact w-16"
          />
          <span className="text-xs text-muted-foreground ml-1">px</span>
        </div>
      </div>
    </div>
  );

  return (
    <TwoPanelToolLayout
      tool={tool}
      title={tool?.label ?? DEFAULT_TITLE}
      description={tool?.description ?? DEFAULT_DESCRIPTION}
      topSection={topSection}
      defaultInputPercent={35}
      inputPane={{
        title: "Input",
        children: (
          <div className="p-2 text-xs text-muted-foreground">
            Set value, source unit, and base font-size above. All conversions appear in the right panel.
          </div>
        ),
      }}
      outputPane={{
        title: "Conversions",
        children: (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 overflow-auto">
            {results.map((r) => (
              <div key={r.unit} className="tool-card flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm font-medium text-primary">{r.value}</div>
                  <div className="text-xs text-muted-foreground">{r.unit}</div>
                </div>
                <CopyButton text={`${r.value}${r.unit}`} />
              </div>
            ))}
          </div>
        ),
      }}
    />
  );
};

export default CssUnitsPage;
