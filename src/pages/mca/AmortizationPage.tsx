import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { calculateAmortization } from "@/core-utils/fintech";
import CopyButton from "@/components/CopyButton";

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AmortizationPage = () => {
  const tool = useCurrentTool();
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [term, setTerm] = useState(24);

  const result = useMemo(() => calculateAmortization(principal, rate, term), [principal, rate, term]);

  const csvExport = useMemo(() => {
    const header = "Month,Payment,Principal,Interest,Balance";
    const rows = result.schedule.map((r) => `${r.month},${r.payment},${r.principal},${r.interest},${r.balance}`);
    return [header, ...rows].join("\n");
  }, [result]);

  return (
    <ToolLayout title={tool?.label ?? "Amortization Calculator"} description={tool?.description ?? "Calculate loan amortization schedules with PMT breakdown"}>
      {/* Inputs */}
      <div className="tool-toolbar">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Principal</label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-32 rounded-md border px-2.5 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Annual Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-24 rounded-md border px-2.5 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Term (months)</label>
          <input
            type="number"
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-20 rounded-md border px-2.5 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="ml-auto">
          <CopyButton text={csvExport} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Monthly Payment", value: fmt(result.monthlyPayment), accent: true },
          { label: "Total Payment", value: fmt(result.totalPayment) },
          { label: "Total Interest", value: fmt(result.totalInterest) },
          { label: "Principal", value: fmt(principal) },
        ].map((item) => (
          <div key={item.label} className="tool-card text-center py-3">
            <div className={`text-sm font-mono font-semibold ${item.accent ? "text-primary" : "text-foreground"}`}>
              {item.value}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Schedule table */}
      <div className="rounded-lg border border-border overflow-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Month</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Payment</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Principal</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Interest</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Balance</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">P/I Ratio</th>
            </tr>
          </thead>
          <tbody>
            {result.schedule.map((row) => {
              const ratio = row.payment > 0 ? ((row.principal / row.payment) * 100).toFixed(0) : "0";
              return (
                <tr key={row.month} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-2 font-mono text-muted-foreground">{row.month}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt(row.payment)}</td>
                  <td className="px-3 py-2 text-right font-mono text-primary">{fmt(row.principal)}</td>
                  <td className="px-3 py-2 text-right font-mono text-destructive">{fmt(row.interest)}</td>
                  <td className="px-3 py-2 text-right font-mono">{fmt(row.balance)}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${ratio}%` }} />
                      </div>
                      <span className="font-mono text-muted-foreground w-8 text-right">{ratio}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ToolLayout>
  );
};

export default AmortizationPage;
