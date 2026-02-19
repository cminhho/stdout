/**
 * Epoch timestamp ↔ Date conversion and formatting. Single place for logic and constants.
 */

export interface TimestampFormatRow {
  label: string;
  value: string;
}

export function formatDateRows(d: Date): TimestampFormatRow[] {
  return [
    { label: "ISO 8601", value: d.toISOString() },
    { label: "UTC", value: d.toUTCString() },
    { label: "Local", value: d.toLocaleString() },
    { label: "Unix (s)", value: String(Math.floor(d.getTime() / 1000)) },
    { label: "Unix (ms)", value: String(d.getTime()) },
    {
      label: "Date",
      value: d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
    },
    {
      label: "Time",
      value: d.toLocaleTimeString("en-US", { hour12: true, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    },
    { label: "Relative", value: getRelative(d) },
  ];
}

export function getRelative(d: Date): string {
  const diff = Date.now() - d.getTime();
  const abs = Math.abs(diff);
  const suffix = diff > 0 ? "ago" : "from now";
  if (abs < 60000) return `${Math.floor(abs / 1000)}s ${suffix}`;
  if (abs < 3600000) return `${Math.floor(abs / 60000)}m ${suffix}`;
  if (abs < 86400000) return `${Math.floor(abs / 3600000)}h ${suffix}`;
  return `${Math.floor(abs / 86400000)}d ${suffix}`;
}

export function unixToDate(unixStr: string): Date | null {
  if (!unixStr.trim()) return null;
  const ts = Number(unixStr);
  if (isNaN(ts)) return null;
  const ms = unixStr.length <= 10 ? ts * 1000 : ts;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function isoToDate(isoStr: string): Date | null {
  if (!isoStr.trim()) return null;
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return null;
  return d;
}

export interface TimestampRef {
  label: string;
  ts: number;
}

export function getCommonRefs(): TimestampRef[] {
  const now = Math.floor(Date.now() / 1000);
  return [
    { label: "Y2K", ts: 946684800 },
    { label: "Unix Epoch", ts: 0 },
    { label: "1h ago", ts: now - 3600 },
    { label: "24h ago", ts: now - 86400 },
  ];
}

export function setCurrentTimeValues(): { unix: string; iso: string; now: number } {
  const n = Date.now();
  return {
    now: n,
    unix: String(Math.floor(n / 1000)),
    iso: new Date(n).toISOString(),
  };
}
