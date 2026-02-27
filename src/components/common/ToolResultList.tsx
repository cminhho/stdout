/** Scrollable result list with title, count, and per-item render. */
import type { ReactNode } from "react";
import React, { memo } from "react";
import { cn } from "@/utils/cn";

export interface ToolResultListProps<T> {
  /** Title shown in header (e.g. "Results") */
  title?: string;
  /** Count for subtitle (e.g. "3 result(s)") */
  count: number;
  items: T[];
  /** Render each item */
  renderItem: (item: T, index: number) => ReactNode;
  /** Optional class for container */
  className?: string;
  /** Max height for scrollable list (default 12rem) */
  maxHeight?: string;
}

/**
 * Result list with count header and bordered list. Uses design tokens (border, muted, spacing).
 * Reusable for XPath results, match lists, etc.
 */
export const ToolResultList = memo(function ToolResultList<T>({
  title,
  count,
  items,
  renderItem,
  className,
  maxHeight = "12rem",
}: ToolResultListProps<T>) {
  return (
    <div
      className={cn("rounded-card border border-border overflow-hidden", className)}
      role="region"
      aria-label={title ? `${title} (${count} items)` : `${count} result(s)`}
    >
      <div className="tool-result-list__header bg-muted/50 tool-caption font-medium">
        {title ? `${title} — ` : ""}
        {count} result{count !== 1 ? "s" : ""}
      </div>
      <ul
        className="divide-y divide-border overflow-y-auto"
        style={{ maxHeight }}
      >
        {items.map((item, i) => (
          <li key={i} className="tool-result-list__item text-xs">
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </div>
  );
}) as <T>(props: ToolResultListProps<T>) => React.ReactElement;

export default ToolResultList;
