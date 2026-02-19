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
 * Use in every tool-panel for consistent alignment across all tools.
 */
const PanelHeader = ({ label, text, onClear, extra }: PanelHeaderProps) => (
  <div className="flex items-center justify-between min-h-[28px]">
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider select-none">
      {label}
    </span>
    <div className="flex items-center gap-2 flex-wrap">
      {extra}
      {text !== undefined ? <CopyButton text={text} /> : null}
      {onClear ? (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 w-7 p-0">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  </div>
);

export default PanelHeader;
