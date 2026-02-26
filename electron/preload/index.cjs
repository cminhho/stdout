/**
 * Preload Script
 * Exposes safe APIs to the renderer via contextBridge.
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  window: {
    close: () => ipcRenderer.invoke("window:close"),
    minimize: () => ipcRenderer.invoke("window:minimize"),
    maximize: () => ipcRenderer.invoke("window:maximize"),
  },
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
