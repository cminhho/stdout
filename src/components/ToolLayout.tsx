import { ReactNode } from "react";

interface ToolLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

/** Single wrapper for all tools: no padding, content fills. */
const ToolLayout = ({ children }: ToolLayoutProps) => (
  <div className="tool-layout-content flex-1 flex flex-col min-h-0 overflow-auto w-full">
    {children}
  </div>
);

export default ToolLayout;
