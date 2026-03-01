# Component Guide

Main UI components used when building tool pages and the app shell.

---

## Layout

### ToolPageLayout

Wraps a tool page and provides an optional **header** slot for the page toolbar.

- **Props**: `toolbar` (ReactNode), `children`, `className`.
- **Usage**: Wrap the main content. For tools with session/share, do not pass a Toolbar; instead register title bar actions via TitleBarActionsContext so Save, Share, and Sessions appear in the unified TitleBar.

### TitleBarActionsContext

Lets tool pages register actions (Save session, Share snippet, Sessions) for the unified TitleBar.

- **API**: `useTitleBarActions()` returns `{ actions, setTitleBarActions, clearTitleBarActions }`. In a tool page, use `useEffect` to call `setTitleBarActions({ toolId, toolName, shareState, onLoadSession })` when the tool is active and `clearTitleBarActions()` on unmount.
- **Usage**: JSON Formatter, Base64, JWT Debugger register via this context so the TitleBar shows Save/Share/Sessions once, without a duplicate toolbar row.

### Toolbar (legacy)

Page-level toolbar component: tool name, Save Session, Share, Sessions, Settings. **Deprecated for new tools**: use TitleBarActionsContext instead so actions appear in the unified TitleBar. The Toolbar component is still present for backwards compatibility but is no longer used by the main session/share tools.

### TwoPanelToolLayout

Two-pane layout (input left, output right) with resizable split, optional toolbars per pane, and output actions (Copy, Download).

- **Props**: Input/output pane config (title, toolbar extra, content, options like `outputFilename`, `showCopy`, `sessionShareInPageToolbar`).
- **Usage**: Most formatters, converters, and encode tools. When `sessionShareInPageToolbar` is true, the layout does not show the Share button in the input pane (handled by the TitleBar instead).

---

## Input / output

### CodeEditor

Code or text editor (e.g. for JSON, XML, plain text). Supports language hints, read-only mode, and optional line numbers.

- Used in both input and output panes of TwoPanelToolLayout.

### Buttons and inputs

- **Button**, **Input**, **Select**, etc. from `src/components/ui/` (or shared UI library). Use consistent `size="xs"` (or the project default) in toolbars so buttons and inputs align in height.
- **OptionsButton**: For tools with many options (e.g. root tag, delimiter); places options in a popover instead of crowding the toolbar.
- **SegmentGroup**: For a small set of mutually exclusive options (e.g. Encode / Decode).

---

## Common patterns

- **Session list**: `SessionListContent` plus `SavedSessionsPopover` or a Dialog; uses `useSessionManager(toolId)`.
- **Sample data**: `SampleDataDropdown` for preset inputs (e.g. JSON Formatter, Regex Tester).
- **Download output**: TwoPanelToolLayout’s output pane accepts `outputFilename` and renders a Download button with label “Download”.

---

## Related

- [Adding Tools](adding-tools.md) — Use these components in a new tool
- [Design / Components](../design/components.md) — Reusable design-system components
