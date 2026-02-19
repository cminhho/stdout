const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  const iconPath = path.join(__dirname, isDev ? "../public/favicon.svg" : "../dist/favicon.svg");

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "stdout",
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Hide default menu (View, Window, Help, etc.) for a cleaner app window
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

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
