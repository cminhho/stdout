# Development Setup

How to run stdout from source and build for web or desktop.

## Prerequisites

- Node.js 20+ (LTS recommended)
- npm (or compatible package manager)

## Setup

```bash
git clone https://github.com/cminhho/stdout.git
cd stdout
npm install
```

## Commands

### Web (Vite)

- `npm run dev` - Dev server (hot reload)
- `npm run build` - Production build to dist/

### Desktop (Electron)

- `npm run electron:dev` - Dev with hot reload
- `npm run electron:build:mac` - Build macOS (arm64 + x64) to release/
- `npm run electron:build:win` - Build Windows
- `npm run electron:build:linux` - Build Linux

### Deploy and Release

- `npm run deploy` - build + compress + firebase deploy
- `npm run release` - patch; `npm run release:minor` / `release:major` for minor/major. Then push branch and tag.

See [Release guide](../release.md) for the full flow.

## Tech stack

- Desktop: Electron 33+
- UI: React 19 + TypeScript
- Build: Vite 5
- Styling: Tailwind CSS, Radix UI
- Package: electron-builder

## Project structure

- src/components/ - App and UI primitives
- src/contexts/ - React context (Settings, Workspace)
- src/hooks/ - useToolEngine, useSessionManager, etc.
- src/pages/ - Tool pages by domain
- src/tools/ - Tool registry (registry.ts), routing, types
- src/utils/ - Domain logic

Tools are registered in src/tools/registry.ts; each page is lazy-loaded.

## Next steps

- [Architecture](architecture.md)
- [Adding Tools](adding-tools.md)
