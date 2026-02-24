import { useCallback, useEffect, useRef, useState } from "react";

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

const KEYBOARD_STEP_PX = 8;

export interface UseSidebarResizeOptions {
  minPx: number;
  maxPx: number;
  value: number;
  onChange: (px: number) => void;
}

/**
 * Resize sidebar by dragging: pixel-based width. Use with a container ref
 * (the layout that contains sidebar + resizer + main). Returns current width
 * (synced with value when not dragging) and resizer handlers.
 */
export function useSidebarResize(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseSidebarResizeOptions
) {
  const { minPx, maxPx, value, onChange } = options;
  const [localPx, setLocalPx] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const latestPxRef = useRef(value);

  useEffect(() => {
    latestPxRef.current = localPx;
  }, [localPx]);

  useEffect(() => {
    if (!isDragging) setLocalPx((prev) => (prev === value ? prev : value));
  }, [value, isDragging]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left } = containerRef.current.getBoundingClientRect();
      const px = e.clientX - left;
      setLocalPx(clamp(minPx, maxPx, px));
    },
    [minPx, maxPx, containerRef]
  );

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    setIsDragging(false);
    onChange(latestPxRef.current);
  }, [handleMouseMove, onChange]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
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
      const delta = e.key === "ArrowRight" ? KEYBOARD_STEP_PX : -KEYBOARD_STEP_PX;
      const next = clamp(minPx, maxPx, localPx + delta);
      setLocalPx(next);
      onChange(next);
    },
    [minPx, maxPx, localPx, onChange]
  );

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const widthPx = isDragging ? localPx : value;
  return { widthPx, onMouseDown, onKeyDown };
}
