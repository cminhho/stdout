/**
 * Electron API type declarations for the renderer (APIs exposed via contextBridge).
 */

/** Payload for updater status events. */
export interface UpdaterStatusPayload {
  event: "checking" | "available" | "not-available" | "downloading" | "downloaded" | "error";
  version?: string;
  percent?: number;
  message?: string;
}

/** Window control methods (close, minimize, maximize). */
export interface ElectronWindowAPI {
  close: () => Promise<void>;
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
}

/** Menu event subscriptions. */
export interface ElectronMenuAPI {
  onOpenSettings: (cb: () => void) => () => void;
  onCheckUpdates: (cb: () => void) => () => void;
}

/** Auto-updater API. */
export interface ElectronUpdaterAPI {
  check: () => Promise<{ done: boolean; error?: string; updateInfo?: { version: string } | null }>;
  quitAndInstall: () => Promise<void>;
  onStatus: (cb: (payload: UpdaterStatusPayload) => void) => () => void;
}

/** Renderer-facing Electron API (exposed as window.electronAPI). */
export interface ElectronAPI {
  platform: "darwin" | "win32" | "linux";
  window?: ElectronWindowAPI;
  menu?: ElectronMenuAPI;
  updater?: ElectronUpdaterAPI;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
