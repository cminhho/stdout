# Development

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** (or compatible package manager)

## Setup

```bash
git clone https://github.com/cminhho/stdout.git
cd stdout
npm install
```

## Commands

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

See [release.md](release.md) for the full flow.

## Tech stack

| Layer   | Technology    |
|---------|---------------|
| Desktop | Electron 33+  |
| UI      | React 19 + TypeScript |
| Build   | Vite 5        |
| Styling | Tailwind CSS, Radix UI |
| Package | electron-builder |

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
