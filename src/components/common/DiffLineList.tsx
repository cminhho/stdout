import { memo } from "react";
import { cn } from "@/utils/cn";

export type DiffLineType = "added" | "removed" | "changed";

export interface DiffLineEntry {
  path: string;
  type: DiffLineType;
  oldValue?: string;
  newValue?: string;
}

export interface DiffLineListProps {
  entries: DiffLineEntry[];
  /** Optional class for the list container */
  className?: string;
}

const PREFIX_LABELS: Record<DiffLineType, string> = {
  added: "+ Added",
  removed: "- Removed",
  changed: "~ Changed",
};

/** VS Code–style diff line: semantic colors (primary/destructive/accent), mono font, 8px grid spacing */
const DiffLineRow = memo(function DiffLineRow({ path, type, oldValue, newValue }: DiffLineEntry) {
  const typeClass =
    type === "added"
      ? "text-primary"
      : type === "removed"
        ? "text-destructive"
        : "text-accent-foreground";

  return (
    <div
      className={cn(
        "text-xs font-mono flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        typeClass
      )}
      role="listitem"
    >
      <span className="inline-block shrink-0 w-24">
        {PREFIX_LABELS[type]}
      </span>
      <span className="text-foreground">{path}</span>
      {type === "changed" && oldValue != null && newValue != null && (
        <span className="text-muted-foreground">
          ({oldValue} → {newValue})
        </span>
      )}
      {type === "added" && newValue != null && (
        <span className="text-muted-foreground">({newValue})</span>
      )}
      {type === "removed" && oldValue != null && (
        <span className="text-muted-foreground">({oldValue})</span>
      )}
    </div>
  );
});

/**
 * List of diff lines with consistent VS Code–style styling (primary/destructive/accent, mono, spacing).
 * Use for Schema Diff and any tool that shows added/removed/changed entries.
 */
export const DiffLineList = memo(function DiffLineList({ entries, className }: DiffLineListProps) {
  return (
    <div
      className={cn("flex flex-col gap-1", className)}
      role="list"
      aria-label="Diff entries"
    >
      {entries.map((entry, i) => (
        <DiffLineRow key={`${entry.path}-${i}`} {...entry} />
      ))}
    </div>
  );
});

export default DiffLineList;
