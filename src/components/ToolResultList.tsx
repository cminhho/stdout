import type { ReactNode } from "react";
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
export function ToolResultList<T>({
  title,
  count,
  items,
  renderItem,
  className,
  maxHeight = "12rem",
}: ToolResultListProps<T>) {
  return (
    <div
      className={cn("rounded-md border border-border overflow-hidden", className)}
      role="region"
      aria-label={title ? `${title} (${count} items)` : `${count} result(s)`}
    >
      <div className="px-2 py-1.5 bg-muted/50 text-xs font-medium text-muted-foreground">
        {title ? `${title} — ` : ""}
        {count} result{count !== 1 ? "s" : ""}
      </div>
      <ul
        className="divide-y divide-border overflow-y-auto"
        style={{ maxHeight }}
      >
        {items.map((item, i) => (
          <li key={i} className="p-2 text-xs">
            {renderItem(item, i)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToolResultList;
