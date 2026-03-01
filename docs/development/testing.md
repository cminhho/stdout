# Testing

How to run tests and the testing approach for stdout.

---

## Running tests

If the project has a test script in `package.json`:

```bash
npm test
```

(or `npm run test`, `npm run test:unit`, etc. depending on setup). Check `package.json` scripts for the exact command.

---

## Current approach

- **Unit tests**: Focus on pure logic (e.g. validators, encoders, formatters) in `src/utils/` or domain modules. No UI required.
- **Component / integration**: If present, tests may use React Testing Library or similar to render layout and tool pages. Lazy-loaded tools can be tested by importing the page module directly in the test.
- **E2E**: Not required for this doc; add a subsection here if E2E is introduced (e.g. Playwright for web or Spectron/Playwright for Electron).

---

## Recommendations

- Add tests for new **utility functions** (encoding, validation, conversion) so regressions are caught.
- When adding a **new tool**, consider at least one test that renders the page and checks basic behavior (e.g. input → output).
- Keep tests fast; mock localStorage and any external deps if needed.

---

## Related

- [Setup](setup.md) — Dev environment and commands
- [Adding Tools](adding-tools.md) — Structure of a new tool
