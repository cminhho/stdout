/**
 * IPC Handlers
 * Registers main–renderer IPC for window controls and updater.
 */
const { ipcMain, BrowserWindow } = require("electron");

function getFocusedWindow() {
  return BrowserWindow.getFocusedWindow();
}

/**
 * Register all IPC handlers
 * @param {() => BrowserWindow | null} getMainWindow
 */
function registerIpcHandlers(getMainWindow) {
  // Window controls (custom title bar when frame: false)
  ipcMain.handle("window:close", () => getFocusedWindow()?.close());
  ipcMain.handle("window:minimize", () => getFocusedWindow()?.minimize());
  ipcMain.handle("window:maximize", () => {
    const w = getFocusedWindow();
    if (w) (w.isMaximized() ? w.unmaximize() : w.maximize());
  });
}

module.exports = { registerIpcHandlers };
