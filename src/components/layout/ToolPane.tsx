/** Single tool pane with optional header (title, toolbar, copy, clear) and body content. */
import { memo } from "react";
import CopyButton from "@/components/common/CopyButton";
import { ClearButton } from "@/components/common/ClearButton";
import { cn } from "@/utils/cn";

const PANEL_BODY_INNER_BASE =
  "flex-1 min-h-0 flex flex-col overflow-hidden pt-0 pb-[var(--spacing-panel-inner-y)]";

function getPanelBodyInnerClass(resizerSide?: "left" | "right"): string {
  if (resizerSide === "left")
    return cn(PANEL_BODY_INNER_BASE, "pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)]");
  if (resizerSide === "right")
    return cn(PANEL_BODY_INNER_BASE, "pl-[var(--spacing-panel-inner-x)] pr-[var(--spacing-panel-resizer-gap)]");
  return cn(PANEL_BODY_INNER_BASE, "px-[var(--spacing-panel-inner-x)]");
}

function getHeaderPaddingClass(resizerSide?: "left" | "right"): string | undefined {
  if (resizerSide === "left") return "pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)]";
  return undefined;
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
 * Tool pane: default header (label, toolbar, clear, copy) or customHeader + body with token padding.
 * Used by ResizableTwoPanel and grid layouts (e.g. CssInlinerPage). Omit resizerSide when not beside a resizer.
 */
export const ToolPane = memo(function ToolPane({ pane, className, style, resizerSide }: ToolPaneProps) {
  const headerPadding = getHeaderPaddingClass(resizerSide);

  return (
    <div className={cn("tool-panel flex flex-col min-h-0 overflow-hidden", className)} style={style}>
      {pane.customHeader ?? (
        <header
          className={cn(
            "panel-header select-none",
            headerPadding ?? "pl-[var(--spacing-panel-inner-x)] pr-[var(--spacing-panel-inner-x)]"
          )}
        >
          <span className="panel-header-label">{pane.title ?? "Panel"}</span>
          <div className="panel-header-actions">
            {pane.toolbar ? (
              <div className="toolbar-actions-row">{pane.toolbar}</div>
            ) : null}
            {pane.onClear ? <ClearButton onClick={pane.onClear} /> : null}
            {pane.copyText !== undefined ? <CopyButton text={pane.copyText} /> : null}
          </div>
        </header>
      )}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className={getPanelBodyInnerClass(resizerSide)}>{pane.children}</div>
      </div>
    </div>
  );
});

export default ToolPane;
