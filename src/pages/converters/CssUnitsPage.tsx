import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { SelectWithOptions } from "@/components/ui/select";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CopyButton from "@/components/CopyButton";
import { CSS_UNITS_LIST, CSS_UNITS_DEFAULT_BASE, convertToAllUnits } from "@/utils/cssUnits";

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

  return (
    <ToolLayout title={tool?.label ?? "CSS Units"} description={tool?.description ?? "Convert between CSS units (px, rem, em, vw)"}>
      <div className="space-y-4 max-w-2xl">
        <div className="tool-card space-y-3">
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
                options={CSS_UNITS_LIST.map((u) => ({ value: u, label: u }))}
                title="From unit"
                aria-label="From unit"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Base font-size</label>
              <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value) || CSS_UNITS_DEFAULT_BASE)} className="input-compact w-16" />
              <span className="text-xs text-muted-foreground ml-1">px</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
      </div>
    </ToolLayout>
  );
};

export default CssUnitsPage;
