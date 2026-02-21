import { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const isDesktop = typeof window !== "undefined" && !!window.electronAPI;

const ToolLayout = ({ title, description, children }: ToolLayoutProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      <div className="tool-layout-inner flex-1 flex flex-col min-h-0 w-full">
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
