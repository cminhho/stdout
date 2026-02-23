import { useState, useRef, useCallback, useEffect } from "react";
import PanelHeader from "@/components/PanelHeader";
import { cn } from "@/utils/cn";

const BREAKPOINT_LG = 1024;
const DEFAULT_MIN_INPUT_PERCENT = 20;
const DEFAULT_MAX_INPUT_PERCENT = 80;
const DEFAULT_INPUT_PERCENT = 50;

const RESIZER_VERTICAL_CLASS =
  "hidden lg:flex shrink-0 flex-col items-center justify-center cursor-col-resize select-none self-stretch h-full min-h-0 relative";
const RESIZER_HORIZONTAL_CLASS =
  "flex lg:hidden shrink-0 items-center justify-center cursor-row-resize select-none w-full relative touch-none";

const PANEL_BODY_CLASS = "flex-1 min-h-0 flex flex-col overflow-hidden";

/** Pane body inner base; use with resizer-side classes when side-by-side to reduce gap next to resizer. */
const PANEL_BODY_INNER_BASE =
  "flex-1 min-h-0 flex flex-col overflow-hidden pt-0 pb-[var(--spacing-panel-inner-y)]";

function getPanelBodyInnerClass(resizerSide?: "left" | "right"): string {
  if (resizerSide === "left") return cn(PANEL_BODY_INNER_BASE, "pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)]");
  if (resizerSide === "right") return cn(PANEL_BODY_INNER_BASE, "pl-[var(--spacing-panel-inner-x)] pr-[var(--spacing-panel-resizer-gap)]");
  return cn(PANEL_BODY_INNER_BASE, "px-[var(--spacing-panel-inner-x)]");
}

function useIsLg(): boolean {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(min-width: ${BREAKPOINT_LG}px)`);
    const fn = () => setIsLg(m.matches);
    fn();
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, []);
  return isLg;
}

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

const KEYBOARD_RESIZE_STEP = 5;
const STACKED_PANE_MIN_HEIGHT = "min(120px, 30vh)";

/** Horizontal split: left pane width % (side-by-side / lg). */
function useHorizontalResize(
  initialPercent: number,
  minPercent: number,
  maxPercent: number,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [percent, setPercent] = useState(initialPercent);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { width, left } = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - left) / width) * 100;
      setPercent(clamp(minPercent, maxPercent, pct));
    },
    [minPercent, maxPercent]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [handleMouseMove, handleMouseUp]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP;
      setPercent((p) => clamp(minPercent, maxPercent, p + delta));
    },
    [minPercent, maxPercent]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { percent, onMouseDown, onKeyDown };
}

/** Vertical split: top pane height % (stacked / small screen). */
function useVerticalResize(
  initialPercent: number,
  minPercent: number,
  maxPercent: number,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  const [percent, setPercent] = useState(initialPercent);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { height, top } = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientY - top) / height) * 100;
      setPercent(clamp(minPercent, maxPercent, pct));
    },
    [minPercent, maxPercent]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
    },
    [handleMouseMove, handleMouseUp]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? KEYBOARD_RESIZE_STEP : -KEYBOARD_RESIZE_STEP;
      setPercent((p) => clamp(minPercent, maxPercent, p + delta));
    },
    [minPercent, maxPercent]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { percent, onMouseDown, onKeyDown };
}

const DEFAULT_INPUT_TITLE = "Input";
const DEFAULT_OUTPUT_TITLE = "Output";

/**
 * Props for one tool pane (input or output).
 * Use `customHeader` to replace the whole header; otherwise use `title` + optional `toolbar`, `copyText`, `onClear`.
 */
export interface PaneProps {
  /** Custom header; when set, title/toolbar/copyText/onClear are ignored */
  customHeader?: React.ReactNode;
  /** Pane title in default header; defaults to "Input" / "Output" per pane when omitted */
  title?: string;
  /** Toolbar actions in default header (Sample, Clear, Indent, Save, etc.) */
  toolbar?: React.ReactNode;
  /** Text for the copy-to-clipboard button in default header */
  copyText?: string;
  /** Clear button in default header (clears pane content) */
  onClear?: () => void;
  /** Pane body (editor, preview, etc.) */
  children: React.ReactNode;
}

export interface ResizableTwoPanelProps {
  /** Input/source pane (left in LTR) – e.g. raw JSON, source text */
  input: PaneProps;
  /** Output/result pane (right in LTR) – e.g. formatted result */
  output: PaneProps;
  /** Initial width of input pane in percent (20–80) */
  defaultInputPercent?: number;
  /** Min width of input pane in percent */
  minInputPercent?: number;
  /** Max width of input pane in percent */
  maxInputPercent?: number;
  /** Resizer grip width in px; when omitted uses --panel-resizer-width */
  resizerWidth?: number;
  className?: string;
}

function Pane({
  pane,
  className,
  style,
  resizerSide,
}: {
  pane: PaneProps;
  className?: string;
  style?: React.CSSProperties;
  /** When 'left'|'right', use smaller padding on that side (next to resizer) when side-by-side. */
  resizerSide?: "left" | "right";
}) {
  return (
    <div className={cn("tool-panel flex flex-col min-h-0 overflow-hidden", className)} style={style}>
      {pane.customHeader ?? (
        <PanelHeader
          label={pane.title}
          text={pane.copyText}
          onClear={pane.onClear}
          extra={pane.toolbar}
        />
      )}
      <div className={PANEL_BODY_CLASS}>
        <div className={getPanelBodyInnerClass(resizerSide)}>{pane.children}</div>
      </div>
    </div>
  );
}

/**
 * Resizable two-pane layout for tools (input | output). Drag the divider to resize the input pane.
 * Stacks vertically below lg breakpoint; side-by-side with resizer on lg+.
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
  const resizerSize = resizerWidth ?? 16;
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
        "gap-0 lg:gap-0",
        "m-0 p-0",
        !isLg && "two-panel-stacked",
        className
      )}
    >
      <Pane
        pane={{ ...input, title: input.title ?? DEFAULT_INPUT_TITLE }}
        resizerSide={isLg ? "right" : undefined}
        className={cn(
          "min-w-0 p-[var(--spacing-panel-gap)]",
          isLg ? "flex-none shrink-0" : "flex-shrink-0"
        )}
        style={
          isLg
            ? { width: `${horizontal.percent}%`, minWidth: "var(--panel-min-width)" }
            : {
                height: `${vertical.percent}%`,
                minHeight: STACKED_PANE_MIN_HEIGHT,
              }
        }
      />

      {/* Horizontal resizer: stacked (small screen) – drag to resize top/bottom height */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-valuenow={vertical.percent}
        aria-valuemin={minInputPercent}
        aria-valuemax={maxInputPercent}
        aria-label="Resize panels vertically"
        tabIndex={0}
        onMouseDown={vertical.onMouseDown}
        onKeyDown={vertical.onKeyDown}
        className={cn(RESIZER_HORIZONTAL_CLASS, "panel-resizer panel-resizer--horizontal")}
        style={{ height: resizerSize, minHeight: resizerSize }}
      >
        <div className="panel-resizer-line absolute inset-x-0 top-1/2 h-px -translate-y-px" />
      </div>

      {/* Vertical resizer: side-by-side (lg+) – drag to resize left/right width */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={horizontal.percent}
        aria-valuemin={minInputPercent}
        aria-valuemax={maxInputPercent}
        aria-label="Resize panels horizontally"
        tabIndex={0}
        onMouseDown={horizontal.onMouseDown}
        onKeyDown={horizontal.onKeyDown}
        className={cn(RESIZER_VERTICAL_CLASS, "panel-resizer p-0 touch-none")}
        style={resizerWidth != null ? { width: resizerWidth, minWidth: resizerWidth } : undefined}
      >
        <div className="panel-resizer-line absolute inset-y-0 left-1/2 w-px -translate-x-px" />
      </div>

      <Pane
        pane={{ ...output, title: output.title ?? DEFAULT_OUTPUT_TITLE }}
        resizerSide={isLg ? "left" : undefined}
        className="flex-1 min-w-0 min-h-0 p-[var(--spacing-panel-gap)]"
      />
    </div>
  );
};

export default ResizableTwoPanel;
