import { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const isElectron = typeof window !== "undefined" && !!window.electronAPI;

const ToolLayout = ({ title, description, children }: ToolLayoutProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      <div className="tool-layout-inner flex-1 flex flex-col min-h-0 w-full px-5 py-4 md:px-6 md:py-5">
        {!isElectron && (
          <div className="flex-shrink-0 mb-4 flex items-baseline gap-3 flex-wrap">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <span className="text-sm text-muted-foreground">— {description}</span>
          </div>
        )}
        <div className="tool-layout-content flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
