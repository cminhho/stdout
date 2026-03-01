# FAQ

Frequently asked questions about stdout.

---

## What is stdout?

Stdout is a **client-side developer tools app**: format (JSON, XML, HTML, SQL, CSS, JS), convert (units, encodings, bases), encode/decode (Base64, URL, JWT, Gzip), and generate (UUIDs, passwords, mock data). One app, 59 tools, no server. The name comes from *standard output* — the stream where results go.

---

## Is stdout free?

Yes. stdout is open source under the **MIT license**. You can use, modify, and distribute it freely.

---

## Does stdout send my data anywhere?

**No.** Everything runs in your browser or in the local Electron app. No data is sent to any server; nothing leaves your device. The app works offline after the first load (web PWA cache or desktop build).

---

## What platforms are supported?

- **Web**: Any modern browser (Chrome, Firefox, Safari, Edge). Hosted at [stdout-tools.web.app](https://stdout-tools.web.app/).
- **Desktop**: macOS, Windows, and Linux via Electron. macOS users can install with `brew install --cask cminhho/tap/stdout`.

---

## Where are the tools defined?

Tools are registered in the source code at `src/tools/registry.ts`. Each tool is a lazy-loaded page component under `src/pages/`. See [Adding Tools](../development/adding-tools.md) for how to add a new tool.

---

## Web vs desktop: what’s the difference?

- **Web**: Run in the browser; no install. Best for quick use or when you can’t install software.
- **Desktop (Electron)**: Native app; can use system features (e.g. deep links `stdout://`), auto-updates, and feels like a local app. Same 59 tools and behavior.

---

## How do I report a bug or request a feature?

Open an issue on [GitHub Issues](https://github.com/cminhho/stdout/issues). For bugs, include your environment (OS, browser or Electron version), steps to reproduce, and expected vs actual behavior. See [Bug Reporting](../troubleshooting/bug-reporting.md) for more detail.
