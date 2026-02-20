/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    platform: "darwin" | "win32" | "linux";
    window?: {
      close: () => Promise<void>;
      minimize: () => Promise<void>;
      maximize: () => Promise<void>;
    };
  };
}
