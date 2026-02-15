import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { useCurrentTool } from "@/hooks/useCurrentTool";
import { validateLedger, type LedgerEntry } from "@/core-utils/fintech";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Download } from "lucide-react";

const newEntry = (): LedgerEntry => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString().split("T")[0],
  description: "",
  account: "",
  debit: 0,
  credit: 0,
});

const SAMPLE_ENTRIES: LedgerEntry[] = [
  { id: "1", date: "2025-01-15", description: "Loan disbursement", account: "Cash", debit: 100000, credit: 0 },
  { id: "2", date: "2025-01-15", description: "Loan disbursement", account: "Loan Receivable", debit: 0, credit: 100000 },
  { id: "3", date: "2025-02-15", description: "Monthly repayment", account: "Cash", debit: 0, credit: 5000 },
  { id: "4", date: "2025-02-15", description: "Monthly repayment - principal", account: "Loan Receivable", debit: 4000, credit: 0 },
  { id: "5", date: "2025-02-15", description: "Monthly repayment - interest", account: "Interest Income", debit: 1000, credit: 0 },
];

const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LedgerSimulatorPage = () => {
  const tool = useCurrentTool();
  const [entries, setEntries] = useState<LedgerEntry[]>(SAMPLE_ENTRIES);

  const validation = useMemo(() => validateLedger(entries), [entries]);

  const updateEntry = useCallback((id: string, field: keyof LedgerEntry, value: string | number) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }, []);

  const addEntry = () => setEntries((prev) => [...prev, newEntry()]);
  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const loadSample = () => setEntries(SAMPLE_ENTRIES);
  const clearAll = () => setEntries([newEntry(), newEntry()]);

  const exportCsv = () => {
    const header = "Date,Description,Account,Debit,Credit";
    const rows = entries.map((e) => `${e.date},"${e.description}","${e.account}",${e.debit},${e.credit}`);
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout title={tool?.label ?? "Ledger Simulator"} description={tool?.description ?? "Preview and validate double-entry ledger transactions"}>
      {/* Toolbar */}
      <div className="tool-toolbar">
        <Button size="sm" onClick={addEntry}><Plus className="h-3.5 w-3.5 mr-1" />Add Row</Button>
        <Button size="sm" variant="outline" onClick={loadSample}>Load Sample</Button>
        <Button size="sm" variant="outline" onClick={clearAll}>Clear</Button>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}><Download className="h-3.5 w-3.5 mr-1" />Export CSV</Button>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            validation.isBalanced ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          }`}>
            {validation.isBalanced ? "✓ Balanced" : "✗ Unbalanced"}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="tool-card text-center py-3">
          <div className="text-sm font-mono font-semibold text-primary">{fmt(validation.totalDebit)}</div>
          <div className="text-[10px] text-muted-foreground">Total Debit</div>
        </div>
        <div className="tool-card text-center py-3">
          <div className="text-sm font-mono font-semibold text-primary">{fmt(validation.totalCredit)}</div>
          <div className="text-[10px] text-muted-foreground">Total Credit</div>
        </div>
        <div className="tool-card text-center py-3">
          <div className={`text-sm font-mono font-semibold ${validation.difference > 0.01 ? "text-destructive" : "text-primary"}`}>
            {fmt(validation.difference)}
          </div>
          <div className="text-[10px] text-muted-foreground">Difference</div>
        </div>
      </div>

      {/* Errors */}
      {validation.errors.length > 0 && (
        <div className="space-y-1 mb-4 max-h-24 overflow-y-auto">
          {validation.errors.map((err, i) => (
            <div key={i} className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-1.5">{err}</div>
          ))}
        </div>
      )}

      {/* Entry table */}
      <div className="rounded-lg border border-border overflow-auto mb-4" style={{ maxHeight: "calc(100vh - 440px)" }}>
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-muted/80 backdrop-blur">
            <tr className="border-b border-border">
              <th className="px-2 py-2 text-left font-medium text-muted-foreground w-28">Date</th>
              <th className="px-2 py-2 text-left font-medium text-muted-foreground">Description</th>
              <th className="px-2 py-2 text-left font-medium text-muted-foreground w-36">Account</th>
              <th className="px-2 py-2 text-right font-medium text-muted-foreground w-28">Debit</th>
              <th className="px-2 py-2 text-right font-medium text-muted-foreground w-28">Credit</th>
              <th className="px-2 py-2 w-8" />
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                <td className="px-2 py-1">
                  <input type="date" value={entry.date} onChange={(e) => updateEntry(entry.id, "date", e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-mono text-xs text-foreground" />
                </td>
                <td className="px-2 py-1">
                  <input value={entry.description} onChange={(e) => updateEntry(entry.id, "description", e.target.value)}
                    placeholder="Description..."
                    className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground" />
                </td>
                <td className="px-2 py-1">
                  <input value={entry.account} onChange={(e) => updateEntry(entry.id, "account", e.target.value)}
                    placeholder="Account name..."
                    className="w-full bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground" />
                </td>
                <td className="px-2 py-1">
                  <input type="number" value={entry.debit || ""} onChange={(e) => updateEntry(entry.id, "debit", Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none outline-none text-xs text-right font-mono text-foreground placeholder:text-muted-foreground" />
                </td>
                <td className="px-2 py-1">
                  <input type="number" value={entry.credit || ""} onChange={(e) => updateEntry(entry.id, "credit", Number(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none outline-none text-xs text-right font-mono text-foreground placeholder:text-muted-foreground" />
                </td>
                <td className="px-1 py-1">
                  <button onClick={() => removeEntry(entry.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Account Summary */}
      {validation.accountSummary.length > 0 && (
        <div className="tool-card">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Account Summary</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {validation.accountSummary.map((acc) => (
              <div key={acc.account} className="rounded border border-border p-2">
                <div className="text-xs font-medium text-foreground truncate">{acc.account}</div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-muted-foreground">Dr: <span className="font-mono text-foreground">{fmt(acc.debit)}</span></span>
                  <span className="text-[10px] text-muted-foreground">Cr: <span className="font-mono text-foreground">{fmt(acc.credit)}</span></span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Net: <span className={`font-mono ${acc.net >= 0 ? "text-primary" : "text-destructive"}`}>{fmt(acc.net)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default LedgerSimulatorPage;
