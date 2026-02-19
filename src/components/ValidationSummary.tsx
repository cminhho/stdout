import { cn } from "@/utils/cn";

export interface ValidationSummaryProps {
  /** null = no input / not run yet */
  valid: boolean | null;
  /** Number of errors (e.g. errors.length). Shown when valid === false. */
  errorCount?: number;
  /** Label when valid (e.g. "Valid JSON", "Valid XML"). */
  validLabel: string;
  /** Label when invalid: string with {count} placeholder, or function(count). */
  invalidLabel?: string | ((count: number) => string);
  /** Optional stats to show as key-value chips (e.g. keys, depth, size). */
  stats?: Record<string, string | number> | null;
  /** Order of stat keys; if omitted, keys are shown in object order. */
  statsOrder?: string[];
  className?: string;
}

const DEFAULT_INVALID_LABEL = (count: number) => (count === 1 ? "✗ 1 error" : `✗ ${count} errors`);

/**
 * Reusable validation summary: valid/invalid badge + optional stats.
 * Use across JSON, XML, CSV, JS, HTML, CSS formatter/validator tools.
 */
const ValidationSummary = ({
  valid,
  errorCount = 0,
  validLabel,
  invalidLabel = DEFAULT_INVALID_LABEL,
  stats,
  statsOrder,
  className,
}: ValidationSummaryProps) => {
  const hasStats = stats && Object.keys(stats).length > 0;
  const orderedKeys = statsOrder ?? (stats ? Object.keys(stats) : []);
  const invalidText =
    typeof invalidLabel === "function"
      ? invalidLabel(errorCount)
      : invalidLabel.replace(/\{count\}/g, String(errorCount));

  return (
    <div className={cn("flex flex-wrap items-center gap-2 text-xs", className)}>
      {valid !== null && (
        <span
          className={cn(
            "px-2 py-0.5 rounded font-medium",
            valid ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"
          )}
        >
          {valid ? `✓ ${validLabel}` : invalidText}
        </span>
      )}
      {hasStats &&
        orderedKeys.map((key) => (
          <span key={key} className="px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
            <span className="font-mono font-medium text-foreground">{stats[key]}</span>
          </span>
        ))}
    </div>
  );
};

export default ValidationSummary;
