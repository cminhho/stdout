<p align="center">
  <img src="public/favicon.svg" width="96" height="96" alt="Stdout" />
</p>

<h1 align="center">Stdout</h1>

<p align="center">
  <strong>Developer tools for format, convert, encode, and generate — all in one place.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#why-stdout">Why Stdout</a> •
  <a href="#philosophy">Philosophy</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="#faq">FAQ</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux%20%7C%20Web-lightgrey" alt="Platform" />
  <img src="https://img.shields.io/badge/electron-33+-47848F?logo=electron" alt="Electron" />
  <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react" alt="React" />
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" /></a>
</p>

<p align="center">
  <strong>stdout</strong> = <em>standard output</em> — the output stream (same idea as terminal <code>stdout</code>). One app for everything that goes to that stream: format, convert, encode, generate.
</p>

---

## Overview

**Stdout** is a client-side developer tools app for formatting, converting, encoding, and generating data. It runs in the browser or as a desktop app. No backend, no signup, no data collection — everything stays on your machine. Use it to format JSON/XML/HTML, convert units and encodings, generate test data, and more. 59 tools in one place, works offline.

---

## Why Stdout

*stdout* = standard output — the stream where results go. The app is that stream for dev tools: one place, no server.

| Need | Stdout |
|------|--------|
| Format or convert without sending data anywhere | 100% client-side; nothing leaves your device |
| One place for JSON, XML, Base64, hashes, etc. | 59 tools in a single app (web or desktop) |
| No signup, no API keys | Run locally; works offline after first load |
| Quick dev tasks (decode JWT, test regex, build cURL) | Focused tools with copy/paste and samples |

---

## Features

| Tool | Description |
|------|-------------|
| JSON Format/Validate | Format, validate & beautify JSON with strict RFC compliance |
| XML Format/Validate | Beautify, minify & validate XML |
| HTML Beautify/Minify | Beautify, minify & validate HTML |
| SQL Formatter | Format and beautify SQL queries |
| CSS Beautifier/Minifier | Beautify or minify CSS (format/minify) |
| JS Beautifier/Minifier | Beautify or minify JavaScript (format/minify) |
| CSS Inliner (Email) | Inline CSS styles into HTML for email templates |
| JSONPath Tester | Test JSONPath expressions against JSON data |
| Schema Diff | Compare two JSON schemas side by side |
| Payload Comparator | Compare two JSON payloads and highlight differences |
| Regex Tester | Test regular expressions with live matching (JS engine; Java-style \ escapes supported) |
| XPath Tester | Run XPath expressions against XML |
| Credit Card Generator & Validator | Luhn check and generate test card numbers |
| Cron Parser | Build and parse cron expressions (Quartz-style) |
| JSON ↔ YAML | Convert between JSON and YAML formats |
| CSV ↔ JSON | Convert between CSV and JSON formats |
| JSON → Table | Visualize JSON data as a table |
| JSON → Types | Generate TypeScript types from JSON |
| JSON ↔ Query String | Convert between JSON and URL query strings |
| Epoch Timestamp | Convert between Unix timestamps and dates |
| Number Base | Convert numbers between bases (bin, oct, dec, hex) |
| Color Converter | Convert colors between HEX, RGB, HSL formats |
| Image ↔ Base64 | Convert images to/from Base64 strings |
| .env Converter | Convert .env files to Netlify, Docker, YAML formats |
| CSS Units | Convert between CSS units (px, rem, em, vw) |
| XSD Generator | Generate minimal XSD schema from XML |
| XSLT Transformer | Transform XML using XSLT stylesheet |
| XML ↔ JSON | Convert between XML and JSON |
| CSV → XML | Convert CSV to XML (first row as element names) |
| URL Encode/Decode | Encode and decode URL components |
| Base64 String Encode/Decode | Encode and decode Base64 strings |
| HTML Entity Encode/Decode | Encode and decode HTML entities |
| JWT Debugger | Decode and inspect JWT tokens |
| QR Code | Generate QR codes from text or URLs |
| Gzip | Compress and decompress with Gzip |
| Certificate Inspector | Inspect and decode X.509 certificates |
| Convert File Encoding | Decode bytes from charset or encode text to UTF-8 |
| Message Digester | MD5, SHA-1, SHA-256 hashes |
| HMAC Generator | Generate HMAC signatures |
| String & List Utilities | Case conversion, line ops (trim, sort, dedupe, list cleanup), escape quotes |
| String Escaper | Escape or unescape text for JSON, XML, CSV, SQL, Java/.NET, and JavaScript string literals |
| String Inspector | Inspect text: character/byte/word/line counts, cursor position, word distribution |
| Text Diff | Compare two texts and highlight differences |
| Lorem Ipsum | Generate placeholder text |
| URL Parser | Parse and inspect URL / query string |
| List of MIME Types | Reference table of common MIME types |
| Markdown Preview | Live preview of Markdown with GFM support |
| UUID Generator | Generate UUIDs (v1, v4, v7) |
| Password Generator | Generate secure passwords with custom rules |
| Random String Generator | Generate cryptographically secure random strings (password, PIN, license key, hex, …) |
| Mock Payload | Generate mock JSON data from a schema |
| ASCII Art | Turn text into ASCII art |
| Log Generator | Generate synthetic log data for testing |
| SVG Viewer | View, edit, and export SVG graphics |
| Image Resizer | Resize images with format conversion |
| cURL Builder | Build cURL commands visually |
| HAR Viewer | Inspect HAR (HTTP Archive) files |
| CSV Viewer | View and search CSV files in a table |
| Math Calculator | Evaluate math expressions |

- 100% client-side — no server, no data collection
- Works offline (PWA cache for web; desktop app fully offline)
- Modular architecture, easy to extend

---

## Philosophy

- **Privacy first** — No server, no tracking; data stays in your browser.
- **Lightweight** — Minimal dependencies.
- **Modular** — Each tool is isolated and independently extendable.
- **Open source (MIT)** — Free to use, modify, and distribute.

---

## Installation

### macOS (desktop)

```bash
brew tap cminhho/tap
brew install --cask cminhho/tap/stdout
```

Open **stdout** from Applications or Spotlight. If macOS blocks the first open (“developer cannot be verified”):

```bash
xattr -cr /Applications/stdout.app
```

### Web

Run locally (see [Development](#development)) or deploy the built `dist/` to any static host.

---

## Development

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (or compatible package manager)

### Setup

```bash
git clone https://github.com/cminhho/stdout.git
cd stdout
npm install
```

### Commands

**Web (Vite)**

```bash
npm run dev      # Dev server
npm run build    # Production build → dist/
```

**Desktop (Electron)**

```bash
npm run electron:dev           # Dev with hot reload
npm run electron:build:mac     # Build macOS (arm64 + x64) → release/
npm run electron:build:win     # Build Windows
npm run electron:build:linux   # Build Linux
```

**Deploy web to Firebase**

```bash
npm run deploy   # build + compress + firebase deploy
```

**Release (bump version + tag → GitHub Release)**

```bash
npm run release        # patch (e.g. 1.1.0 → 1.1.1)
npm run release:minor  # minor; npm run release:major for major
# Then push: git push origin <branch> && git push origin v<version>
```

See [docs/release.md](docs/release.md) for the full flow.

### Tech stack

| Layer | Technology |
|-------|------------|
| Desktop | Electron 33+ |
| UI | React 19 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS, Radix UI |
| Package | electron-builder |

---

## Project structure

```
src/
  components/   # App + UI primitives (ToolLayout, CodeEditor, ui/)
  contexts/     # React context (Settings)
  hooks/        # useToolEngine, useCurrentTool, useToolTracking
  pages/        # Tool pages by domain (converters, encode, formatters, …)
  tools/        # Tool registry (registry.ts), routing, types, tracking
  utils/        # Domain logic (encode, validators, cn, …)
```

Tools are registered in `src/tools/registry.ts`; each page is self-contained and lazy-loaded.

---

## FAQ

| Question | Answer |
|----------|--------|
| **What is Stdout?** | Stdout is a client-side developer tools app: format (JSON, XML, HTML, SQL, CSS, JS), convert (units, encodings, bases), encode/decode (Base64, URL, JWT, Gzip), and generate (UUIDs, passwords, mock data). One app, 59 tools, no server. |
| **Is Stdout free?** | Yes. MIT license; free to use, modify, and distribute. |
| **Does Stdout send my data anywhere?** | No. 100% client-side; nothing leaves your device. Works offline. |
| **What platforms are supported?** | Web (any browser), macOS, Windows, Linux. Desktop builds via Electron. |
| **Where are the tools defined?** | In `src/tools/registry.ts`; each tool is a lazy-loaded page. |

---

## Contributing

Contributions are welcome. See [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) for branch model and workflow. Please keep tools modular and avoid unnecessary dependencies.

---

## Acknowledgments

Stdout builds on open-source projects including [Electron](https://www.electronjs.org/), [React](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), and [Radix UI](https://www.radix-ui.com/).

---

## License

MIT License. See [LICENSE](LICENSE).
