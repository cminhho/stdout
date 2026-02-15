import { ComponentType, LazyExoticComponent } from "react";

export type Edition = "public" | "mca";

export interface ToolDefinition {
  /** Unique tool identifier (kebab-case) */
  id: string;
  /** Route path (e.g. "/encode/base64") */
  path: string;
  /** Display label */
  label: string;
  /** Short description */
  description: string;
  /** Group category for sidebar */
  group: string;
  /** Lucide icon name */
  icon: string;
  /** Which editions include this tool */
  editions: Edition[];
  /** Tags for search */
  tags?: string[];
  /** Lazy-loaded page component */
  component: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
}

export interface ToolPack {
  /** Pack identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Edition this pack belongs to */
  edition: Edition;
  /** Tools in this pack */
  tools: ToolDefinition[];
  /** Optional lifecycle hook: called when pack is registered */
  onRegister?: () => void;
}

export interface ToolGroup {
  label: string;
  tools: ToolDefinition[];
}

/** Middleware that can intercept tool resolution */
export type ToolMiddleware = (
  tool: ToolDefinition,
  context: { edition: Edition }
) => ToolDefinition | null;
