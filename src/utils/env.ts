/**
 * Environment / platform detection for web vs Electron desktop.
 * Use a single source of truth to avoid duplicated checks across components.
 */

export const isDesktop =
  typeof window !== "undefined" && !!(window as { electronAPI?: unknown }).electronAPI;
