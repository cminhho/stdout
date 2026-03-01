# Installation

Install stdout on your system and run it as a web app or desktop application.

---

## Web (browser)

Use the live app at **[https://stdout-tools.web.app/](https://stdout-tools.web.app/)**. No install required; works in any modern browser. After the first load, the app can work offline (PWA cache).

To run the web app locally: clone the repo, run `npm install` and `npm run dev`, then open the URL shown in the terminal. See [Development Setup](../development/setup.md) for details.

---

## macOS (desktop)

Install via Homebrew:

```bash
brew install --cask cminhho/tap/stdout
```

Homebrew will add the tap `cminhho/tap` automatically if needed. Open **stdout** from Applications or Spotlight.

### First open: "developer cannot be verified"

If macOS blocks the first open with a security warning:

```bash
xattr -cr /Applications/stdout.app
```

Then try opening the app again.

---

## Windows and Linux (desktop)

Desktop builds for Windows and Linux are produced by the Electron build process. From the project root:

```bash
npm run electron:build:win   # Windows
npm run electron:build:linux # Linux
```

Output goes to the `release/` directory. You can also download pre-built binaries from [GitHub Releases](https://github.com/cminhho/stdout/releases) when available.

---

## Requirements

- **Web**: Any modern browser (Chrome, Firefox, Safari, Edge).
- **Desktop**: Node.js 20+ is required only for building from source. End users run the packaged app (macOS .app, Windows .exe, or Linux binary).

---

## Next steps

- [Quick Start](quick-start.md) — 5-minute tutorial
- [FAQ](faq.md) — Common questions
