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
    <div
      className={cn("space-y-1.5 overflow-y-auto", className)}
      style={{ maxHeight }}
    >
      {errors.map((err, i) => (
        <div
          key={i}
          className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs space-y-1"
        >
          <div className="flex gap-2">
            <span className="font-mono text-destructive font-medium shrink-0">
              Line {err.line}, Col {err.column}
            </span>
            <span className="text-foreground">{err.message}</span>
          </div>
          {err.snippet != null && err.snippet !== "" && (
            <pre className="font-mono text-muted-foreground text-[10px] bg-muted/50 rounded px-2 py-1 overflow-x-auto">
              {err.snippet}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

export default ValidationErrorList;
