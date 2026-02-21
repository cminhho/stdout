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
});
