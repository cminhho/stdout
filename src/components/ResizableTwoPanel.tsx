import { useRef } from "react";
import PanelResizer from "@/components/PanelResizer";
import ToolPane from "@/components/ToolPane";
import type { PaneProps } from "@/components/ToolPane";
import { useHorizontalResize, useVerticalResize } from "@/hooks/useResizeSplit";
import { useIsLg } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";

const DEFAULT_INPUT_PERCENT = 50;
const DEFAULT_MIN_INPUT_PERCENT = 20;
const DEFAULT_MAX_INPUT_PERCENT = 80;
const DEFAULT_INPUT_TITLE = "Input";
const DEFAULT_OUTPUT_TITLE = "Output";
const STACKED_PANE_MIN_HEIGHT = "min(120px, 30vh)";

export type { PaneProps };

export interface ResizableTwoPanelProps {
  /** Input/source pane (left in LTR) */
  input: PaneProps;
  /** Output/result pane (right in LTR) */
  output: PaneProps;
  defaultInputPercent?: number;
  minInputPercent?: number;
  maxInputPercent?: number;
  resizerWidth?: number;
  className?: string;
}

/**
 * Resizable two-pane layout: input | resizer | output.
 * Side-by-side on lg+; stacked with horizontal resizer below lg.
 */
const ResizableTwoPanel = ({
  input,
  output,
  defaultInputPercent = DEFAULT_INPUT_PERCENT,
  minInputPercent = DEFAULT_MIN_INPUT_PERCENT,
  maxInputPercent = DEFAULT_MAX_INPUT_PERCENT,
  resizerWidth,
  className,
}: ResizableTwoPanelProps) => {
  const isLg = useIsLg();
  const containerRef = useRef<HTMLDivElement>(null);

  const horizontal = useHorizontalResize(
    defaultInputPercent,
    minInputPercent,
    maxInputPercent,
    containerRef
  );
  const vertical = useVerticalResize(
    defaultInputPercent,
    minInputPercent,
    maxInputPercent,
    containerRef
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col lg:flex-row flex-1 min-h-0 w-full",
        "gap-[var(--spacing-two-panel-gap)] lg:gap-[var(--spacing-two-panel-gap)]",
        "m-0 p-0",
        !isLg && "two-panel-stacked",
        className
      )}
    >
      <ToolPane
        pane={{ ...input, title: input.title ?? DEFAULT_INPUT_TITLE }}
        resizerSide={isLg ? "right" : undefined}
        className={cn("min-w-0", isLg ? "flex-none shrink-0" : "flex-shrink-0")}
        style={
          isLg
            ? { width: `${horizontal.percent}%`, minWidth: "var(--panel-min-width)" }
            : { height: `${vertical.percent}%`, minHeight: STACKED_PANE_MIN_HEIGHT }
        }
      />

      <PanelResizer
        orientation="horizontal"
        percent={vertical.percent}
        minPercent={minInputPercent}
        maxPercent={maxInputPercent}
        ariaLabel="Resize panels vertically"
        onMouseDown={vertical.onMouseDown}
        onKeyDown={vertical.onKeyDown}
        width={resizerWidth}
      />
      <PanelResizer
        orientation="vertical"
        percent={horizontal.percent}
        minPercent={minInputPercent}
        maxPercent={maxInputPercent}
        ariaLabel="Resize panels horizontally"
        onMouseDown={horizontal.onMouseDown}
        onKeyDown={horizontal.onKeyDown}
        width={resizerWidth}
      />

      <ToolPane
        pane={{ ...output, title: output.title ?? DEFAULT_OUTPUT_TITLE }}
        resizerSide={isLg ? "left" : undefined}
        className="flex-1 min-w-0 min-h-0"
      />
    </div>
  );
};

export default ResizableTwoPanel;
