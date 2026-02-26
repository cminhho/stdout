import { memo } from "react";
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
const ValidationErrorList = memo(function ValidationErrorList(props: ValidationErrorListProps) {
  const { errors, maxHeight = "120px", className } = props;
  if (errors.length === 0) return null;

  return (
    <ul
      role="list"
      aria-label="Validation errors"
      className={cn("flex flex-col list-none pl-0 m-0 overflow-y-auto", className)}
      style={{ maxHeight, gap: "var(--spacing-block-gap)" }}
    >
      {errors.map((err, i) => (
        <li
          key={`${err.line}-${err.column}-${i}`}
          className="rounded-md border border-destructive/25 border-l-2 border-l-destructive bg-destructive/5 px-2.5 py-2 text-[length:var(--text-ui)] space-y-1.5"
        >
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-mono text-destructive font-medium shrink-0">
              L{err.line}:{err.column}
            </span>
            <span className="text-foreground break-words min-w-0">{err.message}</span>
          </div>
          {err.snippet?.trim() ? (
            <pre className={cn("tool-code-snippet overflow-x-auto")}>
              {err.snippet}
            </pre>
          ) : null}
        </li>
      ))}
    </ul>
  );
});

export default ValidationErrorList;
