import { ReactNode } from "react";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

const ToolLayout = ({ title, description, children }: ToolLayoutProps) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      <div className="tool-layout-inner flex-1 flex flex-col min-h-0 w-full px-4 py-3 md:px-6 md:py-4">
        <div className="flex-shrink-0 mb-3 flex items-baseline gap-2 flex-wrap">
          <h1 className="text-base font-semibold text-foreground">{title}</h1>
          <span className="text-xs text-muted-foreground">— {description}</span>
        </div>
        <div className="tool-layout-content flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ToolLayout;
