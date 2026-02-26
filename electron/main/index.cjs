/**
 * Electron Main Process Entry
 * Window creation, app protocol, menu, IPC, and auto-updater.
 */
const { app, BrowserWindow, protocol, dialog } = require("electron");
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

// ─── Global error handling (avoid silent crash / "lâu lâu bị lỗi") ─────
function logError(prefix, err) {
  const msg = err?.message ?? String(err);
  const stack = err?.stack;
  console.error(`[${APP_NAME}] ${prefix}:`, msg);
  if (stack) console.error(stack);
}

process.on("uncaughtException", (err) => {
  logError("uncaughtException", err);
  if (!isDev && app.isReady()) {
    dialog.showErrorBox(
      `${APP_NAME} Error`,
      `An unexpected error occurred. The app may be unstable.\n\n${err?.message ?? String(err)}`
    );
  }
});

process.on("unhandledRejection", (reason, promise) => {
  logError("unhandledRejection", reason instanceof Error ? reason : new Error(String(reason)));
});

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
      if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
        logError("app protocol", new Error(`File not found: ${resolved}`));
        return callback({ error: -6 });
      }
      callback({ path: resolved });
    } catch (err) {
      logError("app protocol", err);
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

  // Handle load failure (blank window / protocol error) so user gets feedback
  mainWindow.webContents.on("did-fail-load", (_ev, errorCode, errorDescription, validatedURL) => {
    logError(
      "did-fail-load",
      new Error(`${errorCode} ${errorDescription} – ${validatedURL}`)
    );
    if (!isDev && mainWindow && !mainWindow.isDestroyed()) {
      dialog.showMessageBox(mainWindow, {
        type: "error",
        title: APP_NAME,
        message: "Failed to load the app.",
        detail: `${errorDescription}\n(${validatedURL})`,
        buttons: ["Reload", "Quit"],
      }).then(({ response }) => {
        if (response === 0 && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        } else {
          app.quit();
        }
      });
    }
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
    const distPath = path.join(__dirname, "..", "..", "dist");
    const indexPath = path.join(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      logError("missing dist", new Error(`dist not found: ${indexPath}`));
      dialog.showErrorBox(
        `${APP_NAME} Cannot start`,
        "App files are missing. Please reinstall the application."
      );
      mainWindow.close();
      return;
    }
    mainWindow.loadURL("app://./index.html#/");
  }
}

// Single-instance lock: only one app window (avoids duplicate instances / resource conflicts)
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}
app.on("second-instance", () => {
  const win = getMainWindow();
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.whenReady().then(() => {
  try {
    if (!isDev) registerAppProtocol();
    createWindow();
  } catch (err) {
    logError("createWindow", err);
    if (!isDev) {
      dialog.showErrorBox(
        `${APP_NAME} Failed to start`,
        (err?.message ?? String(err)) + "\n\nPlease reinstall the app if this persists."
      );
    }
    app.quit();
    process.exit(1);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
