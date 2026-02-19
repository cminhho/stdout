const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Stdout",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

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
