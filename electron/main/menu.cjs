/**
 * Application Menu
 * Native app menu for macOS / Windows / Linux (Stdout context)
 */
const { Menu, app, shell, BrowserWindow } = require("electron");

function getFocusedWindow() {
  return BrowserWindow.getFocusedWindow();
}

/**
 * Create application menu
 */
function createMenu(getAppVersion) {
  const isMac = process.platform === "darwin";
  const version = typeof getAppVersion === "function" ? getAppVersion() : "1.0.0";

  if (isMac) {
    app.setAboutPanelOptions({
      applicationName: "Stdout",
      applicationVersion: version,
      copyright: "MIT License",
      website: "https://github.com/cminhho/stdout",
    });
  }

  const template = [
    ...(isMac
      ? [
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
                click: () =>
                  shell.openExternal(
                    "https://github.com/cminhho/stdout/blob/main/LICENSE"
                  ),
              },
              { type: "separator" },
              { role: "hide", label: "Hide Stdout" },
              { role: "hideOthers", label: "Hide Others" },
              { role: "unhide", label: "Show All" },
              { type: "separator" },
              { role: "quit", label: "Quit Stdout" },
            ],
          },
        ]
      : []),
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
        ...(isMac
          ? [
              { type: "separator" },
              { role: "front", label: "Bring All to Front" },
            ]
          : [{ role: "close", label: "Close" }]),
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

module.exports = { createMenu };
