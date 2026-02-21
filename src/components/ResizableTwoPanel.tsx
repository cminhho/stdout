import { useState, useRef, useCallback, useEffect } from "react";
import PanelHeader from "@/components/PanelHeader";
import { cn } from "@/utils/cn";

const DEFAULT_RESIZER_WIDTH = 20;
const DEFAULT_MIN_INPUT_PERCENT = 20;
const DEFAULT_MAX_INPUT_PERCENT = 80;
const DEFAULT_INPUT_PERCENT = 50;

const RESIZER_BASE_CLASS =
  "hidden lg:flex shrink-0 flex-col items-center justify-center cursor-col-resize select-none";

const PANEL_BODY_CLASS = "flex-1 min-h-0 flex flex-col overflow-hidden";

function useIsLg(): boolean {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 1024px)");
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

function useResize(
  initialInputPercent: number,
  minInputPercent: number,
  maxInputPercent: number
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputPercent, setInputPercent] = useState(initialInputPercent);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { width, left } = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - left) / width) * 100;
      setInputPercent(clamp(minInputPercent, maxInputPercent, pct));
    },
    [minInputPercent, maxInputPercent]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [handleMouseMove]);

  const onResizerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [handleMouseMove, handleMouseUp]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { containerRef, inputPercent, onResizerMouseDown };
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
  /** Resizer grip width in px */
  resizerWidth?: number;
  className?: string;
}

function Pane({
  pane,
  className,
  style,
}: {
  pane: PaneProps;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("tool-panel flex flex-col min-h-0 overflow-hidden", className)} style={style}>
      {pane.customHeader !== undefined ? (
        pane.customHeader
      ) : (
        <PanelHeader
          label={pane.title}
          text={pane.copyText}
          onClear={pane.onClear}
          extra={pane.toolbar}
        />
      )}
      <div className={PANEL_BODY_CLASS}>{pane.children}</div>
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
  resizerWidth = DEFAULT_RESIZER_WIDTH,
  className,
}: ResizableTwoPanelProps) => {
  const isLg = useIsLg();
  const { containerRef, inputPercent, onResizerMouseDown } = useResize(
    defaultInputPercent,
    minInputPercent,
    maxInputPercent
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col lg:flex-row flex-1 min-h-0 w-full gap-3 lg:gap-0", className)}
    >
      <Pane
        pane={{ ...input, title: input.title ?? DEFAULT_INPUT_TITLE }}
        className="min-w-0 flex-1 lg:flex-none lg:shrink-0"
        style={isLg ? { width: `${inputPercent}%`, minWidth: 120 } : undefined}
      />

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={inputPercent}
        tabIndex={0}
        onMouseDown={onResizerMouseDown}
        className={RESIZER_BASE_CLASS}
        style={{ width: resizerWidth, minWidth: resizerWidth }}
      >
        <div className="w-0.5 h-8 rounded-full bg-border" />
      </div>

      <Pane pane={{ ...output, title: output.title ?? DEFAULT_OUTPUT_TITLE }} className="flex-1 min-w-0 lg:min-h-0" />
    </div>
  );
};

export default ResizableTwoPanel;
