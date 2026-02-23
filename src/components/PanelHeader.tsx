import CopyButton from "@/components/CopyButton";
import { cn } from "@/utils/cn";

const HEADER_BASE =
  "flex items-center justify-between flex-wrap min-h-[var(--spacing-sidebar-header-h)] pt-[var(--spacing-panel-inner-y)] pb-0";

interface PanelHeaderProps {
  label: string;
  text?: string;
  /** Clear action: pass a ClearButton (or other control) via extra when needed. */
  extra?: React.ReactNode;
  /** Override horizontal padding (e.g. pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)] for output pane). */
  className?: string;
}

/**
 * Panel header: label, extra (toolbar + optional clear), copy. Padding matches pane body.
 */
const PanelHeader = ({ label, text, extra, className }: PanelHeaderProps) => (
  <div className={cn(HEADER_BASE, className ?? "px-[var(--spacing-panel-inner-x)]")}>
    <span className="panel-header-label select-none">{label}</span>
    <div className="flex items-center gap-1.5 flex-wrap">
      {extra}
      {text !== undefined ? <CopyButton text={text} /> : null}
    </div>
  </div>
);

export default PanelHeader;
