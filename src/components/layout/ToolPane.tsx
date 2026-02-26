/** Single tool pane with optional header (title, toolbar, copy, clear) and body content. */
import { memo } from "react";
import PanelHeader from "@/components/layout/PanelHeader";
import { ClearButton } from "@/components/common/ClearButton";
import { cn } from "@/utils/cn";

const PANEL_BODY_INNER_BASE =
  "flex-1 min-h-0 flex flex-col overflow-hidden pt-0 pb-[var(--spacing-panel-inner-y)]";

function getPanelBodyInnerClass(resizerSide?: "left" | "right"): string {
  /* Output pane (resizer on left): small gap next to resizer, full inner-x on right for system alignment */
  if (resizerSide === "left")
    return cn(PANEL_BODY_INNER_BASE, "pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)]");
  /* Input pane (resizer on right): full inner-x on left, small gap next to resizer */
  if (resizerSide === "right")
    return cn(PANEL_BODY_INNER_BASE, "pl-[var(--spacing-panel-inner-x)] pr-[var(--spacing-panel-resizer-gap)]");
  return cn(PANEL_BODY_INNER_BASE, "px-[var(--spacing-panel-inner-x)]");
}

/**
 * Props for one tool pane (header + body).
 * Use `customHeader` to replace the whole header; otherwise use `title` + optional `toolbar`, `copyText`, `onClear`.
 */
export interface PaneProps {
  /** Custom header; when set, title/toolbar/copyText/onClear are ignored */
  customHeader?: React.ReactNode;
  /** Pane title in default header */
  title?: string;
  /** Toolbar actions in default header (Sample, Clear, Save, etc.) */
  toolbar?: React.ReactNode;
  /** Text for the copy-to-clipboard button in default header */
  copyText?: string;
  /** Clear button in default header */
  onClear?: () => void;
  /** Pane body (editor, preview, etc.) */
  children: React.ReactNode;
}

export interface ToolPaneProps {
  pane: PaneProps;
  className?: string;
  style?: React.CSSProperties;
  /** When 'left'|'right', use smaller padding on that side (next to resizer) when side-by-side. */
  resizerSide?: "left" | "right";
}

/**
 * Reusable tool pane: header (PanelHeader or custom) + body with token padding.
 * Used by ResizableTwoPanel and by grid layouts (e.g. CssInlinerPage). Omit resizerSide when not beside a resizer.
 */
export const ToolPane = memo(function ToolPane({ pane, className, style, resizerSide }: ToolPaneProps) {
  return (
    <div className={cn("tool-panel flex flex-col min-h-0 overflow-hidden", className)} style={style}>
      {pane.customHeader ?? (
        <PanelHeader
          label={pane.title ?? "Panel"}
          text={pane.copyText}
          extra={
            <>
              {pane.toolbar}
              {pane.onClear ? <ClearButton onClick={pane.onClear} /> : null}
            </>
          }
          className={resizerSide === "left" ? "pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)]" : undefined}
        />
      )}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className={getPanelBodyInnerClass(resizerSide)}>{pane.children}</div>
      </div>
    </div>
  );
});

export default ToolPane;
