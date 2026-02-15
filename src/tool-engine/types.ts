import { ComponentType, LazyExoticComponent } from "react";

export interface ToolDefinition {
  id: string;
  path: string;
  label: string;
  description: string;
  group: string;
  icon: string;
  tags?: string[];
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
}

export interface ToolGroup {
  label: string;
  tools: ToolDefinition[];
}
