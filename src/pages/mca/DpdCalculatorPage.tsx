import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { calculateDpd, getDpdBuckets, type DpdResult } from "@/core-utils/fintech";

const severityColors: Record<DpdResult["severity"], string> = {
  current: "bg-primary/15 text-primary",
  low: "bg-yellow-500/15 text-yellow-500",
  medium: "bg-orange-500/15 text-orange-500",
  high: "bg-destructive/15 text-destructive",
  critical: "bg-red-700/15 text-red-400",
};

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const DpdCalculatorPage = () => {
  const tool = useCurrentTool();
  const today = new Date().toISOString().split("T")[0];
  const [dueDate, setDueDate] = useState(today);
  const [paymentDate, setPaymentDate] = useState(today);
  const [amount, setAmount] = useState(10000);

  const result = useMemo(() => {
    const due = new Date(dueDate);
    const pay = new Date(paymentDate);
    if (isNaN(due.getTime()) || isNaN(pay.getTime())) return null;
    return calculateDpd(due, pay, amount);
  }, [dueDate, paymentDate, amount]);

  const buckets = getDpdBuckets();

  return (
    <ToolLayout title={tool?.label ?? "DPD Calculator"} description={tool?.description ?? "Calculate Days Past Due for debt management"}>
      {/* Inputs */}
      <div className="tool-toolbar">
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            className="rounded-md border px-2.5 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Payment / Check Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
            className="rounded-md border px-2.5 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Outstanding</label>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
            className="w-28 rounded-md border px-2.5 py-1.5 text-xs font-mono bg-background border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      {result && (
        <>
          {/* Result cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="tool-card text-center py-4">
              <div className="text-3xl font-mono font-bold text-foreground">{result.dpd}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Days Past Due</div>
            </div>
            <div className="tool-card text-center py-4">
              <div className={`text-sm font-semibold px-3 py-1 rounded-full inline-block ${severityColors[result.severity]}`}>
                {result.bucket}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2">Classification</div>
            </div>
            <div className="tool-card text-center py-4">
              <div className="text-lg font-mono font-semibold text-destructive">{(result.penaltyRate * 100).toFixed(0)}%</div>
              <div className="text-[10px] text-muted-foreground mt-1">Penalty Rate</div>
            </div>
            <div className="tool-card text-center py-4">
              <div className="text-lg font-mono font-semibold text-destructive">{fmt(result.penaltyAmount)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Penalty Amount</div>
            </div>
          </div>

          {/* Bucket reference */}
          <div className="tool-card">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">DPD Bucket Reference</div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {buckets.map((b, i) => {
                const isActive = result.bucket === b.bucket || (result.dpd === 0 && b.maxDays === 0);
                return (
                  <div key={i} className={`rounded-lg border p-3 text-center transition-all ${
                    isActive ? "border-primary bg-primary/10 ring-1 ring-primary" : "border-border"
                  }`}>
                    <div className="text-xs font-semibold text-foreground">{b.bucket}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {b.maxDays === 0 ? "0 days" : b.maxDays === Infinity ? "90+ days" : `≤ ${b.maxDays} days`}
                    </div>
                    <div className="text-[10px] font-mono text-destructive mt-0.5">
                      {(b.penaltyRate * 100).toFixed(0)}% penalty
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </ToolLayout>
  );
};

export default DpdCalculatorPage;
