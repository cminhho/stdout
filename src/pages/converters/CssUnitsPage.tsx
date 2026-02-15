import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import CopyButton from "@/components/CopyButton";

const units: Record<string, Record<string, (val: number, base: number) => number>> = {
  px: {
    rem: (v, base) => v / base,
    em: (v, base) => v / base,
    pt: (v) => v * 0.75,
    vw: (v) => (v / window.innerWidth) * 100,
    vh: (v) => (v / window.innerHeight) * 100,
    "%": (v) => v,
    cm: (v) => v / 37.7953,
    mm: (v) => v / 3.77953,
    in: (v) => v / 96,
  },
};

const allUnits = ["px", "rem", "em", "pt", "vw", "vh", "%", "cm", "mm", "in"];

const CssUnitsPage = () => {
  const tool = useCurrentTool();
  const [value, setValue] = useState("16");
  const [fromUnit, setFromUnit] = useState("px");
  const [baseFontSize, setBaseFontSize] = useState(16);

  const numVal = parseFloat(value) || 0;

  const toPx = (): number => {
    switch (fromUnit) {
      case "px": return numVal;
      case "rem": case "em": return numVal * baseFontSize;
      case "pt": return numVal / 0.75;
      case "vw": return (numVal / 100) * window.innerWidth;
      case "vh": return (numVal / 100) * window.innerHeight;
      case "%": return numVal;
      case "cm": return numVal * 37.7953;
      case "mm": return numVal * 3.77953;
      case "in": return numVal * 96;
      default: return numVal;
    }
  };

  const pxVal = toPx();
  const results = allUnits.filter((u) => u !== fromUnit).map((u) => {
    const converter = units.px?.[u];
    const converted = converter ? converter(pxVal, baseFontSize) : pxVal;
    return { unit: u, value: Number(converted.toFixed(4)) };
  });

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
              <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="tool-select">
                {allUnits.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Base font-size</label>
              <input type="number" value={baseFontSize} onChange={(e) => setBaseFontSize(Number(e.target.value) || 16)} className="input-compact w-16" />
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
