/**
 * Core fintech utilities — pure functions for MCA Internal Edition.
 */

// ── Amortization ─────────────────────────────────────────────────────

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AmortizationResult {
  schedule: AmortizationRow[];
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

/**
 * Calculate amortization schedule using standard PMT formula.
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate as percentage (e.g. 12 for 12%)
 * @param termMonths - Loan term in months
 */
export const calculateAmortization = (
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationResult => {
  if (principal <= 0 || termMonths <= 0) {
    return { schedule: [], monthlyPayment: 0, totalPayment: 0, totalInterest: 0 };
  }

  const monthlyRate = annualRate / 100 / 12;
  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let m = 1; m <= termMonths; m++) {
    const interest = balance * monthlyRate;
    const principalPart = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPart);

    schedule.push({
      month: m,
      payment: round2(monthlyPayment),
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
    });
  }

  const totalPayment = round2(monthlyPayment * termMonths);
  const totalInterest = round2(totalPayment - principal);

  return { schedule, monthlyPayment: round2(monthlyPayment), totalPayment, totalInterest };
};

// ── DPD (Days Past Due) ──────────────────────────────────────────────

export interface DpdResult {
  dpd: number;
  bucket: string;
  severity: "current" | "low" | "medium" | "high" | "critical";
  penaltyRate: number;
  penaltyAmount: number;
}

const DPD_BUCKETS: { maxDays: number; bucket: string; severity: DpdResult["severity"]; penaltyRate: number }[] = [
  { maxDays: 0, bucket: "Current", severity: "current", penaltyRate: 0 },
  { maxDays: 30, bucket: "1-30 DPD", severity: "low", penaltyRate: 0.02 },
  { maxDays: 60, bucket: "31-60 DPD", severity: "medium", penaltyRate: 0.05 },
  { maxDays: 90, bucket: "61-90 DPD", severity: "high", penaltyRate: 0.10 },
  { maxDays: Infinity, bucket: "90+ DPD", severity: "critical", penaltyRate: 0.15 },
];

/**
 * Calculate Days Past Due and classify into bucket.
 */
export const calculateDpd = (dueDate: Date, paymentDate: Date, outstandingAmount: number): DpdResult => {
  const diffMs = paymentDate.getTime() - dueDate.getTime();
  const dpd = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  const tier = DPD_BUCKETS.find((b) => dpd <= b.maxDays) || DPD_BUCKETS[DPD_BUCKETS.length - 1];

  return {
    dpd,
    bucket: dpd === 0 ? "Current" : tier.bucket,
    severity: dpd === 0 ? "current" : tier.severity,
    penaltyRate: tier.penaltyRate,
    penaltyAmount: round2(outstandingAmount * tier.penaltyRate),
  };
};

export const getDpdBuckets = () => DPD_BUCKETS;

// ── Ledger ───────────────────────────────────────────────────────────

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  account: string;
  debit: number;
  credit: number;
}

export interface LedgerValidation {
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  difference: number;
  errors: string[];
  accountSummary: { account: string; debit: number; credit: number; net: number }[];
}

/**
 * Validate double-entry ledger entries.
 */
export const validateLedger = (entries: LedgerEntry[]): LedgerValidation => {
  const errors: string[] = [];
  let totalDebit = 0;
  let totalCredit = 0;
  const accountMap = new Map<string, { debit: number; credit: number }>();

  entries.forEach((entry, i) => {
    if (!entry.account.trim()) errors.push(`Row ${i + 1}: Missing account name`);
    if (!entry.description.trim()) errors.push(`Row ${i + 1}: Missing description`);
    if (entry.debit < 0) errors.push(`Row ${i + 1}: Debit cannot be negative`);
    if (entry.credit < 0) errors.push(`Row ${i + 1}: Credit cannot be negative`);
    if (entry.debit === 0 && entry.credit === 0) errors.push(`Row ${i + 1}: Both debit and credit are zero`);
    if (entry.debit > 0 && entry.credit > 0) errors.push(`Row ${i + 1}: Entry has both debit and credit`);

    totalDebit += entry.debit;
    totalCredit += entry.credit;

    const acc = accountMap.get(entry.account) || { debit: 0, credit: 0 };
    acc.debit += entry.debit;
    acc.credit += entry.credit;
    accountMap.set(entry.account, acc);
  });

  const difference = round2(Math.abs(totalDebit - totalCredit));
  if (difference > 0.01) {
    errors.push(`Ledger is unbalanced: difference of ${difference}`);
  }

  const accountSummary = Array.from(accountMap.entries()).map(([account, { debit, credit }]) => ({
    account,
    debit: round2(debit),
    credit: round2(credit),
    net: round2(debit - credit),
  }));

  return {
    isBalanced: difference <= 0.01,
    totalDebit: round2(totalDebit),
    totalCredit: round2(totalCredit),
    difference,
    errors,
    accountSummary,
  };
};

// ── Batch Transaction Validator ──────────────────────────────────────

export interface BatchField {
  name: string;
  type: "string" | "number" | "date" | "email";
  required: boolean;
}

export interface BatchValidationError {
  row: number;
  column: string;
  message: string;
}

export interface BatchValidationResult {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: BatchValidationError[];
  summary: string;
}

const DEFAULT_SCHEMA: BatchField[] = [
  { name: "id", type: "string", required: true },
  { name: "amount", type: "number", required: true },
  { name: "date", type: "date", required: true },
  { name: "description", type: "string", required: false },
];

/**
 * Validate a batch of CSV rows against a schema.
 */
export const validateBatch = (
  csvText: string,
  schema: BatchField[] = DEFAULT_SCHEMA
): BatchValidationResult => {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return { totalRows: 0, validRows: 0, invalidRows: 0, errors: [{ row: 0, column: "", message: "File must have header + at least 1 data row" }], summary: "Empty file" };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));
  const errors: BatchValidationError[] = [];

  // Check required columns
  schema.forEach((field) => {
    if (field.required && !headers.includes(field.name.toLowerCase())) {
      errors.push({ row: 0, column: field.name, message: `Missing required column: ${field.name}` });
    }
  });

  let validRows = 0;
  let invalidRows = 0;
  const dataRows = lines.slice(1);

  dataRows.forEach((line, idx) => {
    const row = idx + 2; // 1-indexed, header = row 1
    const values = parseCsvLine(line);
    let rowValid = true;

    schema.forEach((field) => {
      const colIdx = headers.indexOf(field.name.toLowerCase());
      if (colIdx === -1) return;
      const val = values[colIdx]?.trim() || "";

      if (field.required && !val) {
        errors.push({ row, column: field.name, message: `Required field is empty` });
        rowValid = false;
        return;
      }

      if (!val) return;

      if (field.type === "number" && isNaN(Number(val))) {
        errors.push({ row, column: field.name, message: `Invalid number: "${val}"` });
        rowValid = false;
      }

      if (field.type === "date" && isNaN(Date.parse(val))) {
        errors.push({ row, column: field.name, message: `Invalid date: "${val}"` });
        rowValid = false;
      }

      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors.push({ row, column: field.name, message: `Invalid email: "${val}"` });
        rowValid = false;
      }
    });

    if (rowValid) validRows++;
    else invalidRows++;
  });

  const totalRows = dataRows.length;
  const summary = errors.length === 0
    ? `✓ All ${totalRows} rows are valid`
    : `${invalidRows} of ${totalRows} rows have errors (${errors.length} total issues)`;

  return { totalRows, validRows, invalidRows, errors, summary };
};

export const getDefaultSchema = () => [...DEFAULT_SCHEMA];

// ── Helpers ──────────────────────────────────────────────────────────

const round2 = (n: number) => Math.round(n * 100) / 100;

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { result.push(current); current = ""; continue; }
    current += char;
  }
  result.push(current);
  return result;
};
