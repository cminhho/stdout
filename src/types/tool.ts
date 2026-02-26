/**
 * Types for tool definitions and registry.
 */

import type { ComponentType, LazyExoticComponent } from "react";

/** Single tool entry (path, label, lazy component, optional preload). */
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

/** Group of tools (e.g. Formatters, Validators). */
export interface ToolGroup {
  label: string;
  tools: ToolDefinition[];
}
