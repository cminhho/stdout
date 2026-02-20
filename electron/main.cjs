const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const isMac = process.platform === "darwin";

function createWindow() {
  const iconPath = path.join(__dirname, isDev ? "../public/favicon.svg" : "../dist/favicon.svg");

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "stdout",
    icon: iconPath,
    // Custom title bar: no native frame so the web app draws the header (traffic lights + title + actions).
    // On macOS use hiddenInset to keep OS traffic lights; use frame: false for fully custom traffic lights.
    ...(isMac
      ? { titleBarStyle: "hiddenInset" }
      : { frame: false }),
    trafficLightPosition: isMac ? { x: 14, y: 14 } : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // No menu bar (View, Window, Help, etc.) for a cleaner window
  Menu.setApplicationMenu(null);

  if (isDev) {
    win.loadURL("http://localhost:8080");
    win.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "../dist/index.html").replace(/\\/g, "/");
    const fileUrl = indexPath.startsWith("/") ? `file://${indexPath}#/` : `file:///${indexPath}#/`;
    win.loadURL(fileUrl);
  }
}

// Custom window controls when frame: false (Windows/Linux)
ipcMain.handle("window:close", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.close();
});
ipcMain.handle("window:minimize", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) w.minimize();
});
ipcMain.handle("window:maximize", () => {
  const w = BrowserWindow.getFocusedWindow();
  if (w) (w.isMaximized() ? w.unmaximize() : w.maximize());
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
