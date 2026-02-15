import { lazy } from "react";
import { ToolPack, Edition } from "@/tool-engine/types";

const editions: Edition[] = ["mca"];

export const mcaPack: ToolPack = {
  id: "mca-pack",
  name: "MCA Internal Tools",
  edition: "mca",
  tools: [
    // ─── Fintech ─────────────────────────────────────────────
    {
      id: "amortization-calculator",
      path: "/mca/amortization",
      label: "Amortization Calculator",
      description: "Calculate loan amortization schedules with PMT breakdown",
      group: "Fintech",
      icon: "Calculator",
      editions,
      tags: ["loan", "pmt", "interest", "repayment"],
      component: lazy(() => import("@/pages/mca/AmortizationPage")),
    },
    {
      id: "dpd-calculator",
      path: "/mca/dpd",
      label: "DPD Calculator",
      description: "Calculate Days Past Due for debt management",
      group: "Fintech",
      icon: "CalendarClock",
      editions,
      tags: ["dpd", "overdue", "debt", "collection"],
      component: lazy(() => import("@/pages/mca/DpdCalculatorPage")),
    },
    {
      id: "ledger-simulator",
      path: "/mca/ledger",
      label: "Ledger Simulator",
      description: "Preview and validate double-entry ledger transactions",
      group: "Fintech",
      icon: "BookOpen",
      editions,
      tags: ["ledger", "accounting", "double-entry", "debit", "credit"],
      component: lazy(() => import("@/pages/mca/LedgerSimulatorPage")),
    },
    {
      id: "batch-validator",
      path: "/mca/batch-validator",
      label: "Batch Transaction Validator",
      description: "Validate batch file format and data integrity",
      group: "Fintech",
      icon: "FileCheck",
      editions,
      tags: ["batch", "transaction", "validation", "file"],
      component: lazy(() => import("@/pages/mca/BatchValidatorPage")),
    },
  ],
};
