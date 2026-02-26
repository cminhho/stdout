# Why I Built a Local-First Dev Toolbox (And How)

*A decision-led story: from “too many tabs, too much doubt” to one app, zero server.*

---

## The hook

Around Tet, I needed to format a bunch of data and generate passwords and test strings. The usual move: hop between online tools — format JSON here, Base64 there, generate a password somewhere else. Some of those tools are paid. For the rest, I had no idea whether they logged or tracked what I pasted. So I kept switching: one site for encoding, another for generation, another for validation. It was slow and vaguely uncomfortable. I wanted a single place where I could do all of that, with a simple guarantee: **nothing leaves my machine.**

That desire led to a clear set of constraints and a concrete decision, then to an architecture and finally to a real app. This post is that path, written like an ADR (Architecture Decision Record): context → constraints → options → decision → architecture and trade-offs.

---

## Context and constraints

I wasn’t looking for “yet another SaaS.” I was looking for:

- **Local first** — All processing on device; no backend for the tools themselves.
- **No server dependency** — Format, convert, encode, generate without sending data anywhere.
- **Offline** — Usable without the internet after first load (or install).
- **No telemetry** — No analytics, no tracking, no “we might log your input” gray area.

And I wanted this to be **trustworthy at scale**: not only for me, but for a team. The only way to get that trust, in my view, was **open source**: anyone can read the code and satisfy themselves that nothing is sent to a server.

So the real question became: *how* do we get such a toolbox, and what shape should it take?

---

## Options considered

1. **Keep using scattered web tools**  
   Pros: zero build cost. Cons: cost, opacity, no single place, no guarantee about data.

2. **Browser extensions**  
   Pros: close to the tab, can be local. Cons: store policies, review delays, per-browser, and still “does it phone home?” unless it’s open source and you audit it.

3. **Desktop-only app**  
   Pros: clear mental model “runs on my machine.” Cons: no quick link to share, no “try in browser” path; install friction for some users.

4. **Web + desktop from one codebase**  
   Pros: one codebase, one behavior; web for “try now” and sharing; desktop for offline and “it’s an app.” Cons: need a strategy to share logic and UI across both (e.g. Electron + same front-end).

I didn’t want to maintain two separate products. I wanted **one toolbox** that could be used in the browser or as a desktop app, with the same “local only, no telemetry” story in both.

---

## Decision

**Use AI-assisted development to build a local-first toolbox quickly; ship it as open source so anyone can verify behavior and trust it; design it so the same app runs on web and desktop.**

In short:

- **Local-first and open source** — So that “no server, no telemetry” is checkable, not just promised.
- **Single codebase, two surfaces** — Web (static) + desktop (Electron) from the same React app.
- **Scale through trust** — Team adoption is safe because the code is auditable and the runtime is “everything stays on your device.”

That decision led to a concrete project: **[Stdout](https://github.com/cminhho/stdout)** — *standard output* for dev tools: format, convert, encode, generate, in one place.

---

## Architecture snapshot

- **One front-end** — React 19 + TypeScript, built with Vite. No backend; no API routes for the tools themselves.
- **Web** — Static build (`dist/`) deployed to any host (e.g. [stdout-tools.web.app](https://stdout-tools.web.app/)); PWA so it can work offline after first load.
- **Desktop** — Same Vite build loaded inside Electron; one codebase, one set of tools. Builds for macOS (Intel + ARM), Windows, and Linux.
- **Tools** — A single **registry** of tools; each tool is a lazy-loaded route. 59 tools so far: formatters (JSON, XML, HTML, SQL, CSS, JS), converters (timestamp, JSON/YAML, CSV, base64, …), encode/decode (URL, JWT, Gzip, hashes), generators (UUID, password, random string, mock data), and more. All run in the client; no data is sent out.
- **Trust** — Repo is public (MIT). Anyone can clone, build, and confirm there is no telemetry and no backend calls for tool logic.

### Trade-offs

| Choice | Benefit | Trade-off |
|--------|---------|-----------|
| Web + Electron from one codebase | One codebase, one behavior; fast iteration | Electron bundle size; need to keep desktop and web UX aligned |
| Static web + PWA | No server, deploy anywhere, offline after load | First load needs network; no server-side features |
| Lazy-loaded tools per route | Smaller initial load; easy to add tools without bloating the shell | Many small chunks; acceptable for our use case |
| Open source, no telemetry | Trust, team adoption, auditability | No usage analytics; feedback only via issues/discussions |
| Single app for “everything to stdout” | One place for format/convert/encode/generate | Broad scope; we focus on high-leverage dev tasks rather than niche edge cases |

---

## Outcome

**Stdout** today:

- **59 tools** in one app: format (JSON, XML, HTML, SQL, CSS, JS), convert (units, encodings, timestamps, JSON/YAML/CSV, …), encode/decode (Base64, URL, JWT, Gzip, hashes), generate (UUIDs, passwords, random strings, mock data), plus validators, diff, cURL builder, HAR viewer, etc.
- **100% client-side** — No server for the tools; no signup; no data collection.
- **Web and desktop** — Use it in the browser at [stdout-tools.web.app](https://stdout-tools.web.app/) or install on macOS with `brew install --cask cminhho/tap/stdout` (Windows/Linux builds from the same repo).
- **MIT, on GitHub** — [github.com/cminhho/stdout](https://github.com/cminhho/stdout). You can clone, build, and verify that nothing is sent off your machine.

The Tet use case is covered: format data, generate passwords, convert encodings, all in one place, with no subscription and no “we might log this” doubt. Same story for the team: one link or one install, same behavior, and the code is there to prove it.

---

## Summary

- **Problem** — Too many online tools; some paid, some opaque; need local-first, offline, no telemetry.
- **Constraints** — Local only, no backend, offline, no telemetry; trust via open source.
- **Options** — Scattered web tools; extensions; desktop-only; web + desktop.
- **Decision** — One local-first, open-source toolbox; same app on web and desktop; AI-assisted implementation; trust by code audit.
- **Architecture** — Single React/Vite app → static web + Electron desktop; tool registry + lazy-loaded routes; 59 tools, all client-side.
- **Trade-offs** — Electron size and scope vs one codebase and one story; no analytics vs maximum trust.

If you want one place to format, convert, encode, and generate without sending data anywhere, you can try it here: **[Web](https://stdout-tools.web.app/)** · **macOS:** `brew install --cask cminhho/tap/stdout`.
