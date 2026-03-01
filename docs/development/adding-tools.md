# Adding Tools

Tutorial: add a new tool to stdout so it appears in the sidebar and command palette.

---

## Steps

### 1. Create the page component

Add a new file under `src/pages/`, in the right domain folder (e.g. `formatters/`, `converters/`, `encode/`). Example: `src/pages/formatters/MyToolPage.tsx`.

- Use the same patterns as existing pages: `ToolPageLayout`, `TwoPanelToolLayout`, or a single-pane layout as needed.
- Export a default component (the page).

### 2. Register the tool in the registry

Open `src/tools/registry.ts` and add an entry to the `tools` array. Use the same `lazyTool` pattern as other tools:

- **id**: Unique string; used for sessions, snippets, and deep links.
- **path**: URL path (must match route pattern used by ToolRoutes).
- **group**: Sidebar category (Formatters, Encode and Crypto, Converters, etc.).
- **icon**: Lucide icon name (see [Icons](../design/icons.md)).
- **lazyTool**: Wraps the dynamic import so the tool is code-split.

Example shape:

```
{ id: "my-tool", path: "/formatters/my-tool", label: "My Tool",
  description: "Short description", group: "Formatters", icon: "Braces",
  ...lazyTool(() => import("@/pages/formatters/MyToolPage")), }
```

### 3. Add the route

Routes are usually generated from the registry. If the app uses a catch-all and resolves via `matchTool(path)`, the new path is picked up automatically. Check `src/routes/ToolRoutes.tsx` to confirm.

### 4. (Optional) Session and share

If the tool should support sessions and shareable snippets:

- Use `useSessionManager(toolId)` and pass state to SaveSessionButton and ShareSnippetButton.
- Register title bar actions via `useTitleBarActions()` so Save, Share, and Sessions appear in the unified TitleBar: in a `useEffect`, call `setTitleBarActions({ toolId, toolName, shareState, onLoadSession })` when the tool is active, and `clearTitleBarActions()` on unmount or when the tool is not active. See JsonFormatterPage, Base64Page, or JwtDecodePage for reference.

---

## Checklist

- Page component in `src/pages/...`
- Entry in `src/tools/registry.ts` with id, path, label, description, group, icon, lazyTool
- Route resolves (auto from registry or manual in route config)
- (Optional) Session/share UI if desired

---

## Related

- [Component Guide](component-guide.md) - ToolPageLayout, TwoPanelToolLayout, TitleBarActionsContext
- [State Management](state-management.md) - useSessionManager, useSnippetShare
- [Architecture](architecture.md) - Registry and routing
