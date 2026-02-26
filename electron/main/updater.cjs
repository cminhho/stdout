/**
 * Auto-Updater
 * Handles update check and install (packaged app only). No custom feed URL.
 */
const { ipcMain } = require("electron");

/** @type {import("electron-updater").AutoUpdater | null} */
let autoUpdater = null;

function getAutoUpdater() {
  if (autoUpdater != null) return autoUpdater;
  if (!require("electron").app.isPackaged) return null;
  try {
    autoUpdater = require("electron-updater").autoUpdater;
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    return autoUpdater;
  } catch {
    return null;
  }
}

/**
 * Send updater status to a window
 */
function sendUpdaterStatus(win, event, payload) {
  if (win?.webContents && !win.webContents.isDestroyed()) {
    win.webContents.send("updater:status", { event, ...payload });
  }
}

/**
 * Setup auto-updater event listeners (call once at startup)
 */
function setupAutoUpdater(getMainWindow) {
  const updater = getAutoUpdater();
  if (!updater) return;
  const win = () =>
    getMainWindow() ||
    require("electron").BrowserWindow.getFocusedWindow() ||
    require("electron").BrowserWindow.getAllWindows()[0];

  updater.on("checking-for-update", () => sendUpdaterStatus(win(), "checking", {}));
  updater.on("update-available", (info) =>
    sendUpdaterStatus(win(), "available", { version: info?.version })
  );
  updater.on("update-not-available", (info) =>
    sendUpdaterStatus(win(), "not-available", { version: info?.version })
  );
  updater.on("download-progress", (p) =>
    sendUpdaterStatus(win(), "downloading", { percent: p.percent })
  );
  updater.on("update-downloaded", (info) =>
    sendUpdaterStatus(win(), "downloaded", { version: info?.version })
  );
  updater.on("error", (err) =>
    sendUpdaterStatus(win(), "error", {
      message: err?.message || String(err),
    })
  );
}

/**
 * Register IPC handlers for updater (check, quitAndInstall)
 */
function registerUpdateHandlers(getMainWindow) {
  const getFocusedWindow = () => require("electron").BrowserWindow.getFocusedWindow();

  ipcMain.handle("updater:check", async () => {
    const updater = getAutoUpdater();
    if (!updater) return { done: true, error: "not-packaged" };
    try {
      const result = await updater.checkForUpdates();
      return { done: true, updateInfo: result?.updateInfo ?? null };
    } catch (e) {
      return { done: true, error: e?.message ?? String(e) };
    }
  });

  ipcMain.handle("updater:quitAndInstall", () => {
    const updater = getAutoUpdater();
    if (updater) updater.quitAndInstall(false, true);
  });
}

module.exports = {
  getAutoUpdater,
  setupAutoUpdater,
  registerUpdateHandlers,
};
