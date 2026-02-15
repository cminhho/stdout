import { type ReactNode } from "react";
import { Settings2 } from "lucide-react";

export interface ToolOptionsProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
}

/** Collapsible options section for tool pages. Each tool passes its own option controls as children. */
export function ToolOptions({ children, open, onOpenChange, title = "Options" }: ToolOptionsProps) {
  return (
    <div className="mb-4 rounded-lg border border-border bg-muted/20 overflow-hidden">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings2 className="h-3.5 w-3.5" />
          {title}
        </span>
        <span className="text-[10px] opacity-75">{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="px-3 py-2.5 border-t border-border/80 flex flex-wrap items-center gap-x-4 gap-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

export interface OptionFieldProps {
  label: string;
  children: ReactNode;
}

/** Single option row: label + control. Use inside ToolOptions for consistent styling. */
export function OptionField({ label, children }: OptionFieldProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}
