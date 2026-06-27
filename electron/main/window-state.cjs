/**
 * Window state persistence — remembers size / position / maximized / fullscreen
 * across launches. Stored as JSON in userData; no external dependency.
 */
const { app, screen } = require("electron");
const path = require("path");
const fs = require("fs");

const MIN_WIDTH = 720;
const MIN_HEIGHT = 480;
const DEFAULTS = { width: 1280, height: 800 };

function stateFile() {
  return path.join(app.getPath("userData"), "window-state.json");
}

function read() {
  try {
    return JSON.parse(fs.readFileSync(stateFile(), "utf8"));
  } catch {
    return null;
  }
}

/** Is the stored frame at least partially on a currently-connected display? */
function visibleOnDisplay(b) {
  try {
    return screen.getAllDisplays().some((d) => {
      const a = d.workArea;
      return b.x < a.x + a.width && b.x + b.width > a.x && b.y < a.y + a.height && b.y + b.height > a.y;
    });
  } catch {
    return false;
  }
}

/** Resolve initial BrowserWindow bounds + restore flags (validated against displays). */
function getWindowState() {
  const s = read();
  const out = {
    width: DEFAULTS.width,
    height: DEFAULTS.height,
    isMaximized: false,
    isFullScreen: false,
  };
  if (s && typeof s.width === "number" && typeof s.height === "number") {
    out.width = Math.max(MIN_WIDTH, Math.round(s.width));
    out.height = Math.max(MIN_HEIGHT, Math.round(s.height));
    if (
      typeof s.x === "number" &&
      typeof s.y === "number" &&
      visibleOnDisplay({ x: s.x, y: s.y, width: out.width, height: out.height })
    ) {
      out.x = Math.round(s.x);
      out.y = Math.round(s.y);
    }
    out.isMaximized = !!s.isMaximized;
    out.isFullScreen = !!s.isFullScreen;
  }
  return out;
}

/** Persist bounds on resize/move (debounced) and on close. */
function manageWindowState(win) {
  let timer = null;
  const save = () => {
    if (!win || win.isDestroyed()) return;
    try {
      const bounds = win.getNormalBounds ? win.getNormalBounds() : win.getBounds();
      const data = { ...bounds, isMaximized: win.isMaximized(), isFullScreen: win.isFullScreen() };
      fs.writeFileSync(stateFile(), JSON.stringify(data));
    } catch {
      /* ignore write errors */
    }
  };
  const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(save, 400);
  };
  win.on("resize", debounced);
  win.on("move", debounced);
  win.on("close", save);
}

module.exports = { getWindowState, manageWindowState, MIN_WIDTH, MIN_HEIGHT };
