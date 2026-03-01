# Session Management

Some tools let you **save** and **load** named sessions so you can return to a specific state later.

---

## Which tools support sessions?

Session support is available on these **pilot tools**:

- **JSON Format/Validate**
- **Base64 Encode/Decode**
- **JWT Debugger**

Each session stores the current tool state (e.g. input content, options, split position). Sessions are stored locally in your browser or Electron app (localStorage).

---

## Saving a session

1. Open a tool that supports sessions (e.g. JSON Formatter).
2. Set up the input and options as you want.
3. In the **page toolbar** at the top, click the **Save** (disk) icon.
4. Enter a name for the session (e.g. "API response sample") and confirm.
5. The session is saved. You can save multiple sessions per tool (oldest are trimmed when over the limit).

---

## Loading a session

- Click the **Saved sessions** (folder) button in the page toolbar to open the list of saved sessions.
- Click **Load** next to a session to restore its state.
- You can also open **Settings → Sessions** to see and manage sessions for all tools (load or delete).

---

## Managing sessions (Settings)

1. Open **Settings** (gear icon in the sidebar or toolbar).
2. Go to the **Sessions** tab.
3. You see tools that have at least one saved session. For each session you can:
   - **Load** — open the tool and restore that session’s state.
   - **Delete** — remove the session permanently.

Sessions are stored per tool; each tool can have multiple named sessions (up to a limit per tool).

---

## Limits and storage

- Sessions are stored in **localStorage**. Clearing site data will remove them.
- There is a maximum number of sessions per tool; the oldest are removed when the limit is reached.
- Large inputs may be truncated when saved to stay within storage limits.

---

## Related

- [Shareable Snippets](shareable-snippets.md) — Share tool state as a file or URL
- [Settings](settings.md) — General configuration and Sessions tab
