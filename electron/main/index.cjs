/**
 * Electron Main Process Entry
 * Window creation, app protocol, menu, IPC, and auto-updater.
 */
const { app, BrowserWindow, protocol } = require("electron");
const path = require("path");
const fs = require("fs");

const { createMenu } = require("./menu.cjs");
const {
  getAutoUpdater,
  setupAutoUpdater,
  registerUpdateHandlers,
} = require("./updater.cjs");
const { registerIpcHandlers } = require("./ipc-handlers.cjs");

const APP_NAME = "stdout";
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const isMac = process.platform === "darwin";

/** @type {import("electron").BrowserWindow | null} */
let mainWindow = null;

function getMainWindow() {
  return mainWindow;
}

function getAppVersion() {
  try {
    const pkgPath = path.join(__dirname, "..", "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

// Custom app:// protocol: register before app ready (packaged only)
if (!isDev) {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: "app",
      privileges: { standard: true, secure: true, supportFetchAPI: true },
    },
  ]);
}

function registerAppProtocol() {
  const distPath = path.join(__dirname, "..", "..", "dist");
  protocol.registerFileProtocol("app", (request, callback) => {
    try {
      const u = new URL(request.url);
      let requestPath = decodeURIComponent(u.pathname || "")
        .replace(/^\/+/, "")
        .trim() || "index.html";
      const filePath = path.join(distPath, requestPath);
      const resolved = path.resolve(filePath);
      const distResolved = path.resolve(distPath);
      if (
        resolved !== distResolved &&
        !resolved.startsWith(distResolved + path.sep)
      ) {
        return callback({ error: -2 });
      }
      callback({ path: resolved });
    } catch {
      callback({ error: -2 });
    }
  });
}

function createWindow() {
  const iconPath = path.join(
    __dirname,
    "..",
    "..",
    isDev ? "public" : "dist",
    "favicon.svg"
  );

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: APP_NAME,
    icon: iconPath,
    ...(isMac
      ? { titleBarStyle: "hiddenInset" }
      : { frame: false }),
    trafficLightPosition: isMac ? { x: 14, y: 14 } : undefined,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "..", "preload", "index.cjs"),
    },
  });

  mainWindow.setTitle(APP_NAME);
  mainWindow.on("page-title-updated", (ev) => {
    ev.preventDefault();
    mainWindow.setTitle(APP_NAME);
  });

  createMenu(getAppVersion);
  registerIpcHandlers(getMainWindow);
  setupAutoUpdater(getMainWindow);
  registerUpdateHandlers(getMainWindow);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Check for updates shortly after load (packaged app only)
  if (!isDev && getAutoUpdater()) {
    mainWindow.webContents.once("did-finish-load", () => {
      setTimeout(() => getAutoUpdater()?.checkForUpdates(), 4000);
    });
  }

  if (isDev) {
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL("app://./index.html#/");
  }
}

app.whenReady().then(() => {
  if (!isDev) registerAppProtocol();
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
