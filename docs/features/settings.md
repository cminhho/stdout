# Settings

Configure theme, sidebar, editor, and tool visibility from the **Settings** panel.

---

## Opening Settings

- Click the **Settings** (gear) icon in the sidebar or in the page toolbar.
- The Settings panel opens as a modal with several **tabs**.

---

## Tabs

### General

- **Theme**: Dark, Light, Deep dark, or **System** (follow OS preference). When set to System, the app switches with your OS light/dark setting.
- **Sidebar**: Grouped (by category) or Flat list; collapsed state and width.
- **Editor**: Font family and **Word wrap** for code/editor areas.

### Appearance

Visual preferences (if any). May include theme refinements or UI density.

### Tools

- **Hidden tools**: List of tools you have chosen to hide from the sidebar. You can show or hide specific tools to keep the list short. Hidden tools are still openable via the command palette (⌘K / Ctrl+K).

### Sessions

- **Saved sessions**: Lists tools that have at least one saved session. For each session you can **Load** (open tool and restore state) or **Delete**. See [Session Management](session-management.md) for details.

---

## Persistence

Settings are stored in **localStorage** in your browser or Electron app. Clearing site/app data will reset them. They are not synced across devices unless you use the same profile.

---

## Related

- [Session Management](session-management.md) — Save and load sessions
- [Keyboard Shortcuts](keyboard-shortcuts.md) — Command palette and reopen last tool
