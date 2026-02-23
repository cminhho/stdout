import CopyButton from "@/components/CopyButton";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const HEADER_BASE =
  "flex items-center justify-between flex-wrap min-h-[var(--spacing-sidebar-header-h)] pt-[var(--spacing-panel-inner-y)] pb-0";

interface PanelHeaderProps {
  label: string;
  text?: string;
  onClear?: () => void;
  extra?: React.ReactNode;
  /** Override horizontal padding (e.g. pl-[var(--spacing-panel-resizer-gap)] pr-[var(--spacing-panel-inner-x)] for output pane). */
  className?: string;
}

/**
 * Panel header: label, copy, clear/extra. Padding matches pane body; use className to align with body (e.g. output pane).
 */
const PanelHeader = ({ label, text, onClear, extra, className }: PanelHeaderProps) => (
  <div className={cn(HEADER_BASE, className ?? "px-[var(--spacing-panel-inner-x)]")}>
    <span className="panel-header-label select-none">
      {label}
    </span>
    <div className="flex items-center gap-1.5 flex-wrap">
      {extra}
      {text !== undefined ? <CopyButton text={text} /> : null}
      {onClear ? (
        <Button variant="ghost" size="icon-xs" onClick={onClear} aria-label="Clear">
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  </div>
);

export default PanelHeader;
