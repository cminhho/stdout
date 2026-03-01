# State Management

How state is stored and updated: settings, workspace, sessions, and snippets.

---

## Settings

- **Store**: Settings (theme, sidebar, editor, hidden tools, recent/pinned tools) live in a React context and are persisted to **localStorage**.
- **Types**: `src/types/settings.ts` — `SettingsState`, `Theme`, `SidebarMode`, `RecentToolEntry`, etc.
- **Hooks**: `useSettings()` (or equivalent) to read and update settings. Updates are written to localStorage so they survive reloads.

---

## Workspace

- **Purpose**: Optional per-tool state (e.g. split percent, scroll position) so revisiting a tool can restore layout.
- **Store**: Workspace state may be in a context and localStorage (e.g. `stdout-workspace` or similar key). Some tools use it; pilot session tools rely more on explicit sessions.
- **Hooks**: `useWorkspace()`, `useWorkspaceRestore()`, `useWorkspacePersist()` — names may vary; they read/write the current tool’s slice of workspace state.

---

## Sessions

- **Purpose**: Named snapshots for specific tools (JSON Formatter, Base64, JWT Debugger). User saves “Session A” and can load it later.
- **Store**: `src/contexts/sessionStore.ts` — load/save/add/delete sessions; stored in localStorage under a key like `stdout-sessions`. Per-tool list; trimmed when over max per tool.
- **Hooks**: `useSessionManager(toolId)` — returns `sessions`, `refresh`, `saveSession(name, state)`, `getSessionById(id)`, `deleteSession(id)`. Used by SaveSessionButton, SessionListContent, Settings Sessions tab.

---

## Snippets (share)

- **Purpose**: Share tool state as a file (`.stdout.json`) or URL (`stdout://tool-id?snippet=base64...`). Recipient can open and restore state.
- **Logic**: Create snippet payload (toolId, state, id, createdAt); download as JSON or encode for URL. Open via deep-link handler or file import.
- **Hooks**: `useSnippetShare` or similar — build state for Share button; handle “copy link” and “download file”. Deep-link handling in `App.tsx` or a dedicated module; Electron main process registers `stdout://` protocol.

---

## Tool state shape

Per-tool state (for sessions and snippets) is a plain object, e.g.:

- `input`: string
- `scrollPosition`: number (optional)
- `splitPercent`: number (optional)
- Tool-specific options (e.g. indent size, encode/decode mode)

Types may live in a shared type (e.g. `PerToolState`) so session and snippet code stay consistent.

---

## Related

- [Session Management](../features/session-management.md) — User-facing session behavior
- [Shareable Snippets](../features/shareable-snippets.md) — User-facing share behavior
- [Architecture](architecture.md) — Where these sit in the app
