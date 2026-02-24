/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

interface UpdaterStatusPayload {
  event: "checking" | "available" | "not-available" | "downloading" | "downloaded" | "error";
  version?: string;
  percent?: number;
  message?: string;
}

interface Window {
  electronAPI?: {
    platform: "darwin" | "win32" | "linux";
    window?: {
      close: () => Promise<void>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
    };
    menu?: {
      onOpenSettings: (cb: () => void) => () => void;
      onCheckUpdates: (cb: () => void) => () => void;
    };
    updater?: {
      check: () => Promise<{ done: boolean; error?: string; updateInfo?: { version: string } | null }>;
      quitAndInstall: () => Promise<void>;
      onStatus: (cb: (payload: UpdaterStatusPayload) => void) => () => void;
    };
  };
}
