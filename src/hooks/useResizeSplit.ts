import { useCallback, useEffect, useState } from "react";

function clamp(min: number, max: number, value: number): number {
  return Math.min(max, Math.max(min, value));
}

const KEYBOARD_STEP = 5;

/**
 * Resize split by dragging: horizontal (left pane width %). Use with a container ref.
 */
export function useHorizontalResize(
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
    [minPercent, maxPercent, containerRef]
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
      const delta = e.key === "ArrowRight" ? KEYBOARD_STEP : -KEYBOARD_STEP;
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

/**
 * Resize split by dragging: vertical (top pane height %). Use when panels are stacked.
 */
export function useVerticalResize(
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
    [minPercent, maxPercent, containerRef]
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
      const delta = e.key === "ArrowDown" ? KEYBOARD_STEP : -KEYBOARD_STEP;
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
