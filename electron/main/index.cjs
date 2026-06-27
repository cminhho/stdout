/**
 * Electron Main Process Entry
 * Window creation, app protocol, menu, IPC, and auto-updater.
 */
const { app, BrowserWindow, protocol, dialog, shell, nativeTheme, session } = require("electron");
const path = require("path");
const fs = require("fs");

const { getWindowState, manageWindowState, MIN_WIDTH, MIN_HEIGHT } = require("./window-state.cjs");
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

// ─── Global error handling (avoid silent crash on occasional errors) ─────
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

/** Pending stdout:// URL when open-url fires before window is ready (e.g. macOS cold start). */
let pendingDeepLinkUrl = null;

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
  app.setAsDefaultProtocolClient("stdout");
}

// Deep link stdout:// – register early so macOS open-url is not missed
if (!isDev) {
  app.on("open-url", (event, url) => {
    event.preventDefault();
    if (url && url.startsWith("stdout://") && url.length <= 2048) {
      const win = getMainWindow();
      if (win && !win.isDestroyed() && win.webContents) {
        win.webContents.send("open-url", url);
      } else {
        pendingDeepLinkUrl = url;
      }
    }
  });
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

  const state = getWindowState();

  mainWindow = new BrowserWindow({
    width: state.width,
    height: state.height,
    ...(state.x !== undefined ? { x: state.x, y: state.y } : {}),
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    title: APP_NAME,
    icon: iconPath,
    // Avoid white flash on launch: don't show until the first paint is ready.
    show: false,
    ...(isMac
      ? {
          // hiddenInset title bar + real macOS vibrancy (native blur behind translucent chrome).
          titleBarStyle: "hiddenInset",
          trafficLightPosition: { x: 14, y: 13 },
          vibrancy: "under-window",
          visualEffectState: "active",
          backgroundColor: "#00000000", // transparent so vibrancy shows through
        }
      : {
          frame: false,
          // Theme-matched solid background prevents a white flash on Win/Linux.
          backgroundColor: nativeTheme.shouldUseDarkColors ? "#15171c" : "#faf8f6",
        }),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "..", "preload", "index.cjs"),
    },
  });

  // Restore maximized / fullscreen, then reveal once content has painted.
  mainWindow.once("ready-to-show", () => {
    if (state.isFullScreen) mainWindow.setFullScreen(true);
    else if (state.isMaximized) mainWindow.maximize();
    mainWindow.show();
  });

  // Persist size / position / maximized / fullscreen across launches.
  manageWindowState(mainWindow);

  // Open external links in the system browser, never inside the app window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (ev, url) => {
    const internal = url.startsWith("app://") || url.startsWith("http://localhost");
    if (!internal) {
      ev.preventDefault();
      if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    }
  });

  // Recover from a renderer crash instead of leaving a frozen/blank window.
  mainWindow.webContents.on("render-process-gone", (_ev, details) => {
    logError("render-process-gone", new Error(`renderer gone: ${details?.reason ?? "unknown"}`));
    if (isDev || !mainWindow || mainWindow.isDestroyed()) return;
    dialog
      .showMessageBox(mainWindow, {
        type: "error",
        title: APP_NAME,
        message: "The app stopped responding and needs to reload.",
        buttons: ["Reload", "Quit"],
        defaultId: 0,
      })
      .then(({ response }) => {
        if (response === 0 && mainWindow && !mainWindow.isDestroyed()) mainWindow.reload();
        else app.quit();
      });
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

  // Deep link: send pending stdout:// URL (macOS open-url before window ready) or argv (Windows/Linux cold start)
  mainWindow.webContents.once("did-finish-load", () => {
    if (pendingDeepLinkUrl) {
      mainWindow.webContents.send("open-url", pendingDeepLinkUrl);
      pendingDeepLinkUrl = null;
    }
    const argvUrl = process.argv.find((a) => typeof a === "string" && a.startsWith("stdout://"));
    if (argvUrl && argvUrl.length <= 2048) mainWindow.webContents.send("open-url", argvUrl);
  });

  // Auto-update: silent background check + download (no native notification; in-app toast when ready)
  if (!isDev && getAutoUpdater()) {
    mainWindow.webContents.once("did-finish-load", () => {
      const delayMs = 5000;
      setTimeout(() => {
        getAutoUpdater()?.checkForUpdates?.();
      }, delayMs);
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
app.on("second-instance", (_event, commandLine) => {
  const win = getMainWindow();
  if (win && !win.isDestroyed() && win.webContents) {
    const url = commandLine.find((arg) => typeof arg === "string" && arg.startsWith("stdout://"));
    if (url && url.length <= 2048) win.webContents.send("open-url", url);
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

/** Strict-ish CSP for the packaged app:// origin. Inline styles/scripts are needed
 *  (theme bootstrap + injected styles); remote script/object/frame loading is blocked. */
function applyContentSecurityPolicy() {
  const csp = [
    "default-src 'self' app:",
    "script-src 'self' app: 'unsafe-inline'",
    "style-src 'self' app: 'unsafe-inline'",
    "img-src 'self' app: data: blob:",
    "font-src 'self' app: data:",
    "connect-src 'self' app: https://api.github.com https://github.com https://*.githubusercontent.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: { ...details.responseHeaders, "Content-Security-Policy": [csp] },
    });
  });
}

app.whenReady().then(() => {
  try {
    if (!isDev) {
      registerAppProtocol();
      applyContentSecurityPolicy();
    }
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
