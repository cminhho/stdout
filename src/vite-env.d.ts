/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

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
  };
}
