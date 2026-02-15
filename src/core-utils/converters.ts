/**
 * Core converter utilities — pure functions.
 */

// ── Timestamp ────────────────────────────────────────────────────────

export const timestampToDate = (ts: number): Date => {
  const ms = String(ts).length <= 10 ? ts * 1000 : ts;
  return new Date(ms);
};

export const dateToTimestamp = (date: Date, unit: "s" | "ms" = "s"): number =>
  unit === "s" ? Math.floor(date.getTime() / 1000) : date.getTime();

export const formatDateMulti = (d: Date) => ({
  iso: d.toISOString(),
  utc: d.toUTCString(),
  local: d.toLocaleString(),
  unixS: Math.floor(d.getTime() / 1000),
  unixMs: d.getTime(),
});

// ── Number Base ──────────────────────────────────────────────────────

export const convertBase = (value: string, fromBase: number, toBase: number): string => {
  const decimal = parseInt(value, fromBase);
  if (isNaN(decimal)) throw new Error("Invalid number for the given base");
  return decimal.toString(toBase).toUpperCase();
};

// ── UUID ─────────────────────────────────────────────────────────────

export const generateUuidV4 = (): string =>
  crypto.randomUUID();
