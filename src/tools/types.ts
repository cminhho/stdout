import { ComponentType, LazyExoticComponent } from "react";

export interface ToolDefinition {
  id: string;
  path: string;
  label: string;
  description: string;
  group: string;
  icon: string;
  tags?: string[];
  component: LazyExoticComponent<ComponentType<unknown>> | ComponentType<unknown>;
  /** Call to prefetch the tool chunk (e.g. on link hover). Same module as component. */
  preload?: () => Promise<{ default: ComponentType<unknown> }>;
}

export interface ToolGroup {
  label: string;
  tools: ToolDefinition[];
}
