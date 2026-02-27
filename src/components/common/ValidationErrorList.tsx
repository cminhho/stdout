/** List of parse/validation errors with line, column, message, and optional code snippet. */
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
      className={cn("validation-error-list flex flex-col list-none pl-0 m-0 overflow-y-auto", className)}
      style={{ maxHeight }}
    >
      {errors.map((err, i) => (
        <li
          key={`${err.line}-${err.column}-${i}`}
          className="validation-error-list__item text-[length:var(--text-ui)]"
        >
          <div className="validation-error-list__meta flex flex-wrap items-baseline">
            <span className="font-mono text-destructive font-medium shrink-0">
              L{err.line}:{err.column}
            </span>
            <span className="text-foreground break-words min-w-0">{err.message}</span>
          </div>
          {err.snippet?.trim() ? (
            <pre className="tool-code-snippet overflow-x-auto">
              {err.snippet}
            </pre>
          ) : null}
        </li>
      ))}
    </ul>
  );
});

export default ValidationErrorList;
