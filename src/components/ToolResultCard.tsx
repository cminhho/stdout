import type { ReactNode } from "react";
import CopyButton from "@/components/CopyButton";
import { cn } from "@/utils/cn";

export interface ToolResultCardProps {
  /** Optional header line (e.g. "3 differences" or "✓ Identical"). */
  summary?: ReactNode;
  /** When set, shows CopyButton in header (or standalone if no summary). */
  copyText?: string;
  /** Main content (diff list, message, etc.). */
  children: ReactNode;
  className?: string;
}

/**
 * Standard card for tool results: optional summary + CopyButton row, then content.
 * Uses .tool-card styling for consistency with other tool pages.
 */
export function ToolResultCard({
  summary,
  copyText,
  children,
  className,
}: ToolResultCardProps) {
  const hasHeader = summary != null || copyText != null;

  return (
    <div className={cn("tool-card m-4", className)}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-[var(--spacing-block-gap)] mb-[var(--spacing-block-gap)]">
          {summary != null ? (
            <span className="text-[var(--text-ui)] text-muted-foreground">{summary}</span>
          ) : (
            <span />
          )}
          {copyText != null ? <CopyButton text={copyText} /> : null}
        </div>
      )}
      {children}
    </div>
  );
}

export default ToolResultCard;
