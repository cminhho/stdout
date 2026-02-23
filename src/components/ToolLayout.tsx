import { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { isDesktop } from "@/utils/env";

interface ToolLayoutProps {
  title: string;
  description: string;
  /** When false, no inner padding (e.g. TwoPanelToolLayout uses own Pane spacing). Default true = same padding as Pane (panel-inner-x/y). */
  contentPadding?: boolean;
  children: ReactNode;
}

const ToolLayout = ({ title, description, contentPadding = true, children }: ToolLayoutProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      <div
        className={cn(
          "tool-layout-inner flex-1 flex flex-col min-h-0 w-full",
          contentPadding && "tool-layout-inner--padded"
        )}
      >
        {!isDesktop && (
          <header className="tool-layout-title flex-shrink-0 flex items-baseline gap-2 flex-wrap">
            <h1 className="text-base font-semibold tracking-tight text-foreground">{title}</h1>
            <span className="text-sm text-muted-foreground">· {description}</span>
          </header>
        )}
        <div className="tool-layout-content flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
