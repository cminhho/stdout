# Shareable Snippets

Share your tool state with others (or with yourself on another device) using **snippets**: either as a `.stdout.json` file or as a `stdout://` URL.

---

## What is a snippet?

A snippet captures the current state of a tool (e.g. input content, options) so someone else can open the same tool with the same state. Snippets work for tools that support sharing (e.g. JSON Formatter, Base64, JWT Debugger).

---

## Creating a snippet

1. Open a tool that supports sharing and set up the input/options as you want.
2. In the **page toolbar**, click the **Share** (share) button.
3. Choose one or both:
   - **Download as file** — saves a `.stdout.json` file you can send or store.
   - **Copy link** — copies a `stdout://` URL (base64-encoded state) to the clipboard for pasting in chat, docs, or bookmarks.

---

## Opening a snippet

- **From a file**: Open or drag the `.stdout.json` file into the app (or use the appropriate “Open snippet” flow if the app supports it).
- **From a URL**: Click or open a `stdout://tool-id?snippet=...` link. The app will navigate to the tool and restore the state from the encoded snippet. (In Electron, opening such a link can launch or focus the app.)

---

## Use cases

- Share a JSON sample or JWT with a teammate via Slack or email (paste the link or send the file).
- Bookmark a specific tool state for later (e.g. a regex pattern and test string).
- Integrate with other apps or CLI scripts that open `stdout://` URLs.

---

## Privacy and size

- Snippet content is in the file or URL. Do not share sensitive data in public links.
- Very large state may produce long URLs; the file option is better for big payloads.

---

## Related

- [Session Management](session-management.md) — Save and load sessions locally
- [Deep linking](https://github.com/cminhho/stdout) — How `stdout://` URLs work (see repo docs)
