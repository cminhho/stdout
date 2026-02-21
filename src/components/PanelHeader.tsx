import CopyButton from "@/components/CopyButton";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PanelHeaderProps {
  label: string;
  text?: string;
  onClear?: () => void;
  extra?: React.ReactNode;
}

/**
 * Standardized panel header with label, copy button, and optional clear/extra actions.
 * Padding matches pane body (--spacing-panel-inner-x/y). No bottom padding; .tool-panel gap separates header from body.
 */
const PanelHeader = ({ label, text, onClear, extra }: PanelHeaderProps) => (
  <div className="flex items-center justify-between flex-wrap min-h-[var(--spacing-sidebar-header-h)] px-[var(--spacing-panel-inner-x)] pt-[var(--spacing-panel-inner-y)] pb-0">
    <span className="text-sm font-medium text-foreground uppercase tracking-wider select-none">
      {label}
    </span>
    <div className="flex items-center gap-1.5 flex-wrap">
      {extra}
      {text !== undefined ? <CopyButton text={text} /> : null}
      {onClear ? (
        <Button variant="ghost" size="icon-xs" onClick={onClear} aria-label="Clear">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  </div>
);

export default PanelHeader;
