import { memo } from "react";
import { cn } from "@/utils/cn";

export interface PanelResizerProps {
  orientation: "horizontal" | "vertical";
  percent: number;
  minPercent: number;
  maxPercent: number;
  ariaLabel: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  width?: number;
  className?: string;
}

/**
 * Accessible resizer bar between two panels. Use with useHorizontalResize / useVerticalResize
 * (from ResizableTwoPanel or a custom layout). Renders horizontal bar when stacked, vertical when side-by-side.
 */
const PanelResizer = memo(function PanelResizer({
  orientation,
  percent,
  minPercent,
  maxPercent,
  ariaLabel,
  onMouseDown,
  onKeyDown,
  width,
  className,
}: PanelResizerProps) {
  return (
  <div
    role="separator"
    aria-orientation={orientation}
    aria-valuenow={percent}
    aria-valuemin={minPercent}
    aria-valuemax={maxPercent}
    aria-label={ariaLabel}
    tabIndex={0}
    onMouseDown={onMouseDown}
    onKeyDown={onKeyDown}
    className={cn(
      "panel-resizer",
      orientation === "horizontal"
        ? cn("flex lg:hidden shrink-0 items-center justify-center cursor-row-resize select-none w-full relative touch-none", "panel-resizer--horizontal")
        : cn("hidden lg:flex shrink-0 flex-col items-center justify-center cursor-col-resize select-none self-stretch h-full min-h-0 relative", "p-0 touch-none"),
      className
    )}
    style={
      width != null
        ? orientation === "horizontal"
          ? { height: width, minHeight: width }
          : { width, minWidth: width }
        : undefined
    }
  >
    <div
      className={
        orientation === "horizontal"
          ? "panel-resizer-line absolute inset-x-0 top-1/2 h-px -translate-y-px"
          : "panel-resizer-line absolute inset-y-0 left-1/2 w-px -translate-x-px"
      }
    />
  </div>
  );
});

export default PanelResizer;
