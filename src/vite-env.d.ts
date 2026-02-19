/// <reference types="vite/client" />

interface Window {
  electronAPI?: { platform: "darwin" | "win32" | "linux" };
}
