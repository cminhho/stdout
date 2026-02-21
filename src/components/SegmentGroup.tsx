import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export interface SegmentGroupOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentGroupProps<T extends string> {
  /** Current selected value. */
  value: T;
  /** Called when selection changes. */
  onValueChange: (value: T) => void;
  /** Options to display; each has value and label. */
  options: SegmentGroupOption<T>[];
  /** Accessible name for the group (e.g. "Conversion direction"). */
  ariaLabel: string;
  /** Button size; defaults to "xs". */
  size?: "xs" | "sm";
  /** Optional class for the container. */
  className?: string;
  /** Disable all options. */
  disabled?: boolean;
}

/**
 * Segmented control: one-of-many selection with clear active state.
 * Container uses border-border and bg-muted/30; active = primary, inactive = ghost (muted hover).
 * Accessible (role="group", aria-pressed). Use for e.g. JSON↔YAML direction, compress/decompress.
 */
function SegmentGroupInner<T extends string>(
  {
    value,
    onValueChange,
    options,
    ariaLabel,
    size = "xs",
    className,
    disabled = false,
  }: SegmentGroupProps<T>,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "flex rounded-md border border-border bg-muted/30 p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size={size}
            className="min-w-0 px-2.5"
            aria-pressed={isActive}
            disabled={disabled}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}

const SegmentGroup = React.forwardRef(SegmentGroupInner) as <T extends string>(
  props: SegmentGroupProps<T> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement;

export { SegmentGroup };
