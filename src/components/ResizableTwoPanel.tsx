import { useState, useRef, useCallback, useEffect } from "react";
import PanelHeader from "@/components/PanelHeader";
import { cn } from "@/utils/cn";

const RESIZER_WIDTH = 20;
const MIN_LEFT_PCT = 20;
const MAX_LEFT_PCT = 80;
const DEFAULT_LEFT_PCT = 50;

const RESIZER_CLASS =
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

function useResize(defaultLeftPct: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPct, setLeftPct] = useState(defaultLeftPct);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const { width, left } = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - left) / width) * 100;
    setLeftPct(clamp(MIN_LEFT_PCT, MAX_LEFT_PCT, pct));
  }, []);

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

  return { containerRef, leftPct, onResizerMouseDown };
}

export interface PanelSlotProps {
  label: string;
  extra?: React.ReactNode;
  text?: string;
  onClear?: () => void;
  children: React.ReactNode;
}

export interface ResizableTwoPanelProps {
  left: PanelSlotProps;
  right: PanelSlotProps;
  defaultLeftPct?: number;
  className?: string;
}

function PanelSlot({
  slot,
  className,
  style,
}: {
  slot: PanelSlotProps;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={cn("tool-panel flex flex-col min-h-0 overflow-hidden", className)} style={style}>
      <PanelHeader
        label={slot.label}
        text={slot.text}
        onClear={slot.onClear}
        extra={slot.extra}
      />
      <div className={PANEL_BODY_CLASS}>{slot.children}</div>
    </div>
  );
}

/**
 * Two-panel layout with draggable resizer. Uses PanelHeader per side; resize by dragging the divider.
 */
const ResizableTwoPanel = ({
  left,
  right,
  defaultLeftPct = DEFAULT_LEFT_PCT,
  className,
}: ResizableTwoPanelProps) => {
  const isLg = useIsLg();
  const { containerRef, leftPct, onResizerMouseDown } = useResize(defaultLeftPct);

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col lg:flex-row flex-1 min-h-0 w-full gap-4 lg:gap-0", className)}
    >
      <PanelSlot
        slot={left}
        className="min-w-0 flex-1 lg:flex-none lg:shrink-0"
        style={isLg ? { width: `${leftPct}%`, minWidth: 120 } : undefined}
      />

      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={leftPct}
        tabIndex={0}
        onMouseDown={onResizerMouseDown}
        className={RESIZER_CLASS}
        style={{ width: RESIZER_WIDTH, minWidth: RESIZER_WIDTH }}
      >
        <div className="w-0.5 h-8 rounded-full bg-border" />
      </div>

      <PanelSlot slot={right} className="flex-1 min-w-0 lg:min-h-0" />
    </div>
  );
};

export default ResizableTwoPanel;
