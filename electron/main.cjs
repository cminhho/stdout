const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_NAME = "stdout";
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;
const isMac = process.platform === "darwin";

function getFocusedWindow() {
  return BrowserWindow.getFocusedWindow();
}

function getAppVersion() {
  try {
    const pkgPath = path.join(__dirname, "../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

function setMacOSApplicationMenu() {
  if (!isMac) return;
  const version = getAppVersion();
  app.setAboutPanelOptions({
    applicationName: "Stdout",
    applicationVersion: version,
    copyright: "MIT License",
    website: "https://github.com/cminhho/stdout",
  });
  const template = [
    {
      label: "Stdout",
      submenu: [
        { label: "About Stdout", click: () => app.showAboutPanel() },
        { type: "separator" },
        {
          label: "Settings…",
          accelerator: "Cmd+,",
          click: () => {
            const w = getFocusedWindow();
            if (w?.webContents) w.webContents.send("menu:open-settings");
          },
        },
        {
          label: "Check for Updates…",
          click: () => {
            const w = getFocusedWindow();
            if (w?.webContents) w.webContents.send("menu:check-updates");
          },
        },
        {
          label: "License…",
          click: () => shell.openExternal("https://github.com/cminhho/stdout/blob/main/LICENSE"),
        },
        { type: "separator" },
        { role: "hide", label: "Hide Stdout" },
        { role: "hideOthers", label: "Hide Others" },
        { role: "unhide", label: "Show All" },
        { type: "separator" },
        { role: "quit", label: "Quit Stdout" },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo", label: "Undo" },
        { role: "redo", label: "Redo" },
        { type: "separator" },
        { role: "cut", label: "Cut" },
        { role: "copy", label: "Copy" },
        { role: "paste", label: "Paste" },
        { role: "selectAll", label: "Select All" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload", label: "Reload" },
        { role: "forceReload", label: "Force Reload" },
        { role: "toggleDevTools", label: "Toggle Developer Tools" },
        { type: "separator" },
        { role: "resetZoom", label: "Actual Size" },
        { role: "zoomIn", label: "Zoom In" },
        { role: "zoomOut", label: "Zoom Out" },
        { type: "separator" },
        { role: "togglefullscreen", label: "Toggle Full Screen" },
      ],
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize", label: "Minimize" },
        { role: "zoom", label: "Zoom" },
        { type: "separator" },
        { role: "front", label: "Bring All to Front" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "stdout on GitHub",
          click: () => shell.openExternal("https://github.com/cminhho/stdout"),
        },
      ],
    },
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const iconPath = path.join(__dirname, isDev ? "../public/favicon.svg" : "../dist/favicon.svg");

  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: APP_NAME,
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

  win.setTitle(APP_NAME);
  win.on("page-title-updated", (ev) => {
    ev.preventDefault();
    win.setTitle(APP_NAME);
  });

  if (isMac) setMacOSApplicationMenu();
  else Menu.setApplicationMenu(null);

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
ipcMain.handle("window:close", () => getFocusedWindow()?.close());
ipcMain.handle("window:minimize", () => getFocusedWindow()?.minimize());
ipcMain.handle("window:maximize", () => {
  const w = getFocusedWindow();
  if (w) (w.isMaximized() ? w.unmaximize() : w.maximize());
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
