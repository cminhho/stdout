/** Wrapper for tool pages with optional top toolbar. Aligns toolbar padding with panel headers. */
import { memo, type ReactNode } from "react";
import { cn } from "@/utils/cn";

export interface ToolPageLayoutProps {
  /** Optional toolbar row (Save session, Share, Sessions, etc.). */
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}

const TOOLBAR_PADDING = "pl-[var(--spacing-panel-inner-x)] pr-[var(--spacing-panel-inner-x)]";

const ToolPageLayout = memo(function ToolPageLayout({
  toolbar,
  children,
  className,
}: ToolPageLayoutProps) {
  return (
    <div className={cn("flex flex-1 flex-col min-h-0 min-w-0", className)}>
      {toolbar ? (
        <header
          className={cn(
            "panel-header shrink-0 border-b border-border",
            TOOLBAR_PADDING
          )}
        >
          {toolbar}
        </header>
      ) : null}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">{children}</div>
    </div>
  );
});

export default ToolPageLayout;
