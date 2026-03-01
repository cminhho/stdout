# Component Guide

Main UI components used when building tool pages and the app shell.

---

## Layout

### ToolPageLayout

Wraps a tool page and provides an optional **header** slot for the page toolbar.

- **Props**: `toolbar` (ReactNode), `children`, `className`.
- **Usage**: Wrap the main content; pass a `Toolbar` as `toolbar` for tools that have session/share so the toolbar appears at the top with consistent styling.

### Toolbar

Page-level toolbar: tool name, Save Session, Share Snippet, Sessions (popover or dialog), and Settings link.

- **Props**: `toolName`, `toolId`, `shareState`, `onLoadSession`, `settingsHref`, `className`.
- **Usage**: Used inside `ToolPageLayout` for pilot tools (JSON Formatter, Base64, JWT Debugger). Renders session/share buttons only when `toolId` and `shareState` are provided.

### TwoPanelToolLayout

Two-pane layout (input left, output right) with resizable split, optional toolbars per pane, and output actions (Copy, Download).

- **Props**: Input/output pane config (title, toolbar extra, content, options like `outputFilename`, `showCopy`, `sessionShareInPageToolbar`).
- **Usage**: Most formatters, converters, and encode tools. When `sessionShareInPageToolbar` is true, the layout does not show the Share button in the input pane (handled by the page Toolbar instead).

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
