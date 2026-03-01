# Architecture

High-level overview of how stdout is built and how its main parts fit together.

---

## Stack

- **Electron** (desktop) or **browser** (web): Same React app; Electron adds a main process, deep links, and auto-updates.
- **React 19 + TypeScript**: UI and state.
- **Vite 5**: Build, dev server, and code-splitting.
- **Tailwind CSS + Radix UI**: Styling and accessible primitives.

---

## Tool registry and routing

- **Registry**: All tools are defined in `src/tools/registry.ts`. Each entry has an `id`, `path`, `label`, `description`, `group`, `icon`, and a **lazy-loaded** React component.
- **Routing**: Routes are derived from the registry (e.g. `/formatters/json` → JSON Formatter). See `src/routes/ToolRoutes.tsx` and `src/tools/matchTool.ts`.
- **Lazy loading**: Each tool is a separate chunk; the app loads the component only when the user opens that tool. This keeps initial load small and speeds up navigation.

---

## Layout and UI

- **ToolPageLayout**: Wraps a tool page and optionally shows a **Toolbar** (tool name, Save Session, Share, Sessions, Settings).
- **TwoPanelToolLayout**: Common layout for input/output panes with resizable split, toolbars, and optional Download/Copy on the output side.
- **Sidebar**: Lists tools by group; supports search and (when enabled) recent/pinned tools. Uses settings (sidebar mode, collapsed, width).

---

## State and persistence

- **Settings**: Theme, sidebar, editor font, word wrap, hidden tools, recent tools, pinned tools. Stored in localStorage via a settings context/store.
- **Workspace**: Optional per-tool state (e.g. split percent, scroll position) for restore on revisit. Some tools use it; others rely only on sessions.
- **Sessions**: Named snapshots for pilot tools (JSON Formatter, Base64, JWT Debugger). Stored in localStorage; managed by `sessionStore` and `useSessionManager`.
- **Snippets**: Shareable state as `.stdout.json` or `stdout://` URL; deep-link handler in the app and (for Electron) in the main process.

---

## Key files

| Area | Path |
|------|------|
| Tool registry | `src/tools/registry.ts` |
| Tool types | `src/tools/types.ts` |
| Routing | `src/routes/ToolRoutes.tsx`, `src/tools/matchTool.ts` |
| Layout | `src/components/layout/ToolPageLayout.tsx`, `TwoPanelToolLayout.tsx`, `Toolbar.tsx` |
| Settings | `src/contexts/settingsStore.ts`, `src/types/settings.ts` |
| Sessions | `src/contexts/sessionStore.ts`, `src/hooks/useSessionManager.ts` |
| Deep link / snippet | `src/App.tsx` (or dedicated deep-link/snippet modules) |

---

## Related

- [Adding Tools](adding-tools.md) — Add a new tool to the registry and routes
- [Component Guide](component-guide.md) — UI components used by tools
- [State Management](state-management.md) — Hooks and contexts in detail
