/** Panel header – label, optional extra (toolbar/clear), and copy button. */
import { memo } from "react";
import CopyButton from "@/components/common/CopyButton";
import { cn } from "@/utils/cn";

interface PanelHeaderProps {
  label: string;
  text?: string;
  /** Clear action: pass a ClearButton (or other control) via extra when needed. */
  extra?: React.ReactNode;
  /** Override horizontal padding (e.g. pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)] for output pane). */
  className?: string;
}

/**
 * Panel header: label, extra (toolbar + optional clear), copy. Padding matches pane body. Mobile: compact gap, label truncates.
 */
const PanelHeader = memo(function PanelHeader({ label, text, extra, className }: PanelHeaderProps) {
  return (
    <header
      className={cn(
        "panel-header select-none",
        className ?? "pl-[var(--spacing-panel-inner-x)] pr-[var(--spacing-panel-inner-x)]"
      )}
    >
      <span className="panel-header-label">{label}</span>
      <div className="panel-header-actions">
        {extra}
        {text !== undefined ? <CopyButton text={text} /> : null}
      </div>
    </header>
  );
});

export default PanelHeader;
