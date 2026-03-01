/**
 * Global keyboard shortcut labels for UI hints. Shown in placeholders and tooltips
 * so end users discover ⌘K / Ctrl+Shift+T without reading docs.
 */

/** Open command palette: Mac ⌘K, Windows/Linux Ctrl+K */
export const SHORTCUT_COMMAND_PALETTE = "⌘K / Ctrl+K";

/** Reopen last closed tool (VS Code-style) */
export const SHORTCUT_REOPEN_LAST = "Ctrl+Shift+T";

/** Placeholder hint for tool search inputs that can be replaced by the palette */
export const SEARCH_TOOLS_PLACEHOLDER = `Search tools by name, description, or category… (${SHORTCUT_COMMAND_PALETTE} to open from anywhere)`;

/** Shorter placeholder for sidebar search */
export const SIDEBAR_SEARCH_PLACEHOLDER = `Search… or ${SHORTCUT_COMMAND_PALETTE}`;

/** Command palette: in-palette keyboard hints */
export const COMMAND_PALETTE_HINT_NAV = "↑↓ Navigate · Enter Open · Esc Close";
export const COMMAND_PALETTE_HINT_REOPEN = `${SHORTCUT_REOPEN_LAST} Reopen last tool`;
