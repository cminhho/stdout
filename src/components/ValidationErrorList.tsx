import type { ParseError } from "@/utils/validationTypes";
import { cn } from "@/utils/cn";

export interface ValidationErrorListProps {
  errors: ParseError[];
  /** Max height for scroll (e.g. "120px", "10rem"). */
  maxHeight?: string;
  className?: string;
}

/**
 * Reusable list of parse/validation errors with line, column, message, and optional snippet.
 * Use across JSON, XML, CSV, and other tools that report line-based errors.
 */
const ValidationErrorList = ({
  errors,
  maxHeight = "120px",
  className,
}: ValidationErrorListProps) => {
  if (errors.length === 0) return null;

  return (
    <ul
      role="list"
      aria-label="Validation errors"
      className={cn("space-y-1 overflow-y-auto list-none pl-0 m-0", className)}
      style={{ maxHeight }}
    >
      {errors.map((err, i) => (
        <li
          key={`${err.line}-${err.column}-${i}`}
          className="rounded-md border border-destructive/25 bg-destructive/5 px-2.5 py-2 text-xs space-y-1.5"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-destructive font-medium shrink-0">
              L{err.line}:{err.column}
            </span>
            <span className="text-foreground break-words min-w-0">{err.message}</span>
          </div>
          {err.snippet != null && err.snippet !== "" ? (
            <pre className="font-mono text-muted-foreground text-[11px] leading-snug bg-muted/40 rounded-md px-2 py-1.5 overflow-x-auto border border-border/50">
              {err.snippet}
            </pre>
          ) : null}
        </li>
      ))}
    </ul>
  );
};

export default ValidationErrorList;
