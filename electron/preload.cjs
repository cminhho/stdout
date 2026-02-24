const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  // For custom title bar when frame: false (e.g. Windows/Linux). Not needed for macOS hiddenInset (OS draws traffic lights).
  window: {
    close: () => ipcRenderer.invoke("window:close"),
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
  },
  // macOS app menu actions (Stdout → Settings…, Check for Updates…, etc.). Return unsubscribe.
  menu: {
    onOpenSettings: (cb) => {
      const handler = () => cb();
      ipcRenderer.on("menu:open-settings", handler);
      return () => ipcRenderer.removeListener("menu:open-settings", handler);
    },
    onCheckUpdates: (cb) => {
      const handler = () => cb();
      ipcRenderer.on("menu:check-updates", handler);
      return () => ipcRenderer.removeListener("menu:check-updates", handler);
    },
  },
  // Auto-updater (packaged app only): check, install, and status events.
  updater: {
    check: () => ipcRenderer.invoke("updater:check"),
    quitAndInstall: () => ipcRenderer.invoke("updater:quitAndInstall"),
    onStatus: (cb) => {
      const handler = (_ev, payload) => cb(payload);
      ipcRenderer.on("updater:status", handler);
      return () => ipcRenderer.removeListener("updater:status", handler);
    },
  },
});
