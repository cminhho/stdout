/**
 * IPC Handlers
 * Registers main–renderer IPC for window controls and updater.
 */
const { ipcMain } = require("electron");

/**
 * Register all IPC handlers
 * @param {() => import("electron").BrowserWindow | null} getMainWindow
 */
function registerIpcHandlers(getMainWindow) {
  // Window controls (custom title bar). Act on the app's main window explicitly
  // (not the focused window) so dev tools / future aux windows can't be targeted.
  ipcMain.handle("window:close", () => getMainWindow()?.close());
  ipcMain.handle("window:minimize", () => getMainWindow()?.minimize());
  ipcMain.handle("window:maximize", () => {
    const w = getMainWindow();
    if (w) (w.isMaximized() ? w.unmaximize() : w.maximize());
  });
  ipcMain.handle("window:isMaximized", () => getMainWindow()?.isMaximized() ?? false);
}

module.exports = { registerIpcHandlers };
