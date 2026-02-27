/** Segment group – compact option group (e.g. CSV/JSON direction) with single selection. */
import { forwardRef, memo, type Ref } from "react";
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
 * Compact layout matching toolbar buttons (CopyButton, h-7); border and radius from design tokens. Accessible (role="group", aria-pressed).
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
  ref: Ref<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      className={cn("segment-group", className)}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <Button
            key={option.value}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size={size}
            className="min-w-0 text-xs"
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

const SegmentGroup = memo(forwardRef(SegmentGroupInner)) as <T extends string>(
  props: SegmentGroupProps<T> & { ref?: Ref<HTMLDivElement> }
) => React.ReactElement;

export { SegmentGroup };
