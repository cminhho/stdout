import { useState, useRef, useCallback, useEffect } from "react";
import PanelHeader from "@/components/PanelHeader";
import { cn } from "@/utils/cn";

const DEFAULT_RESIZER_WIDTH = 20;
const DEFAULT_MIN_PRIMARY_PERCENT = 20;
const DEFAULT_MAX_PRIMARY_PERCENT = 80;
const DEFAULT_PRIMARY_PERCENT = 50;

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
  initialPrimaryPercent: number,
  minPrimaryPercent: number,
  maxPrimaryPercent: number
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [primaryPercent, setPrimaryPercent] = useState(initialPrimaryPercent);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { width, left } = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - left) / width) * 100;
      setPrimaryPercent(clamp(minPrimaryPercent, maxPrimaryPercent, pct));
    },
    [minPrimaryPercent, maxPrimaryPercent]
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

  return { containerRef, primaryPercent, onResizerMouseDown };
}

/**
 * Props for one pane in the split layout.
 * Use `header` for a custom header; otherwise use `label` + optional `extra`, `text`, `onClear` for the default PanelHeader.
 */
export interface PaneProps {
  /** Custom header; when set, label/extra/text/onClear are ignored */
  header?: React.ReactNode;
  /** Pane title (default header) */
  label: string;
  /** Actions in default header (e.g. buttons) */
  extra?: React.ReactNode;
  /** Text for copy button in default header */
  text?: string;
  /** Clear button in default header */
  onClear?: () => void;
  /** Pane body */
  children: React.ReactNode;
}

export interface ResizableTwoPanelProps {
  /** First (leading) pane – left in LTR */
  primary: PaneProps;
  /** Second (trailing) pane – right in LTR */
  secondary: PaneProps;
  /** Initial size of primary pane in percent (20–80) */
  defaultPrimaryPercent?: number;
  /** Min size of primary pane in percent */
  minPrimaryPercent?: number;
  /** Max size of primary pane in percent */
  maxPrimaryPercent?: number;
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
      {pane.header !== undefined ? (
        pane.header
      ) : (
        <PanelHeader
          label={pane.label}
          text={pane.text}
          onClear={pane.onClear}
          extra={pane.extra}
        />
      )}
      <div className={PANEL_BODY_CLASS}>{pane.children}</div>
    </div>
  );
}

/**
 * Resizable two-pane layout (split pane). Drag the divider to resize the primary pane.
 * Stacks vertically below lg breakpoint; side-by-side with resizer on lg+.
 */
const ResizableTwoPanel = ({
  primary,
  secondary,
  defaultPrimaryPercent = DEFAULT_PRIMARY_PERCENT,
  minPrimaryPercent = DEFAULT_MIN_PRIMARY_PERCENT,
  maxPrimaryPercent = DEFAULT_MAX_PRIMARY_PERCENT,
  resizerWidth = DEFAULT_RESIZER_WIDTH,
  className,
}: ResizableTwoPanelProps) => {
  const isLg = useIsLg();
  const { containerRef, primaryPercent, onResizerMouseDown } = useResize(
    defaultPrimaryPercent,
    minPrimaryPercent,
    maxPrimaryPercent
  );

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col lg:flex-row flex-1 min-h-0 w-full gap-4 lg:gap-0", className)}
    >
      <Pane
        pane={primary}
        className="min-w-0 flex-1 lg:flex-none lg:shrink-0"
        style={isLg ? { width: `${primaryPercent}%`, minWidth: 120 } : undefined}
      />

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={primaryPercent}
        tabIndex={0}
        onMouseDown={onResizerMouseDown}
        className={RESIZER_BASE_CLASS}
        style={{ width: resizerWidth, minWidth: resizerWidth }}
      >
        <div className="w-0.5 h-8 rounded-full bg-border" />
      </div>

      <Pane pane={secondary} className="flex-1 min-w-0 lg:min-h-0" />
    </div>
  );
};

export default ResizableTwoPanel;
