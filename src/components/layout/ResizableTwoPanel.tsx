/** Resizable two-pane layout: input | resizer | output; side-by-side on lg+, stacked below. */
import { memo, useMemo, useRef } from "react";

import PanelResizer from "@/components/layout/PanelResizer";
import ToolPane from "@/components/layout/ToolPane";
import type { PaneProps } from "@/components/layout/ToolPane";
import { useHorizontalResize, useVerticalResize } from "@/hooks/useResizeSplit";
import { useIsLg } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/cn";

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
const ResizableTwoPanel = memo(function ResizableTwoPanel({
  input,
  output,
  defaultInputPercent = 50,
  minInputPercent = 20,
  maxInputPercent = 80,
  resizerWidth,
  className,
}: ResizableTwoPanelProps) {
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

  const inputPaneProps = useMemo(
    () => ({ ...input, title: input.title ?? "Input" }),
    [input]
  );
  const outputPaneProps = useMemo(
    () => ({ ...output, title: output.title ?? "Output" }),
    [output]
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
        pane={inputPaneProps}
        resizerSide={isLg ? "right" : undefined}
        className={cn("min-w-0", isLg ? "flex-none shrink-0" : "flex-shrink-0")}
        style={
          isLg
            ? { width: `${horizontal.percent}%`, minWidth: "var(--panel-min-width)" }
            : { height: `${vertical.percent}%`, minHeight: "min(120px, 30vh)" }
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
        pane={outputPaneProps}
        resizerSide={isLg ? "left" : undefined}
        className="flex-1 min-w-0 min-h-0"
      />
    </div>
  );
});

export default ResizableTwoPanel;
