# Contributing to Stdout

Thanks for your interest in contributing. The goal is to keep the codebase open and easy to contribute to. By participating, you agree to our [Code of Conduct](CODE_OF_CONDUCT.md).

## Git Flow

This project follows **Git Flow** for branches and releases.

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Only merged from `release/*` or `hotfix/*`. |
| `develop` | Integration branch for the next release. Default branch for feature work. |
| `feature/<name>` | New features. Branch from `develop`, merge back into `develop`. |
| `release/<version>` | Release preparation (e.g. `release/1.2.0`). Branch from `develop`; merge to `main` and back to `develop`. |
| `hotfix/<name>` | Urgent production fixes. Branch from `main`; merge to `main` and `develop`. |

**Workflow:**

- Start new work from `develop`: `git checkout develop && git pull && git checkout -b feature/my-feature`.
- When the feature is done, open a PR into `develop`.
- To release: branch from `develop` into `release/x.y.z`, do version bumps/changelog, then merge to `main` and `develop`, tag `main` (e.g. `v1.2.0`).
- For hotfixes: branch from `main` into `hotfix/short-fix-name`, fix, then merge to `main` and `develop`, tag on `main`.

If you use [git-flow](https://github.com/nvie/gitflow): run `git flow init` (accept defaults) then use `git flow feature start my-feature`, `git flow release start 1.2.0`, `git flow hotfix start fix-name`, etc.

## How to contribute

- **Bug reports & feature ideas:** Open a [GitHub Issue](https://github.com/cminhho/stdout/issues). Use the issue templates (Bug report / Feature request) when possible.
- **Code changes:** Open a Pull Request. Keep PRs focused (one feature/fix per PR when possible). The [PR template](.github/PULL_REQUEST_TEMPLATE.md) will guide you.
- **New tools:** Register your tool in `src/tool-engine/registry.ts` (see existing entries for structure), implement the page under `src/pages/`, and add the lazy-loaded component to the registry. Core logic should live in `src/utils/` when it’s pure logic.

## Setup

```bash
git clone https://github.com/cminhho/stdout.git
cd stdout
git checkout develop   # use develop for day-to-day work
npm i
npm run dev
```

Run tests: `npm run test`. Lint: `npm run lint`.

## Code style

- The project uses [EditorConfig](https://editorconfig.org) (`.editorconfig`) for indentation and line endings.
- TypeScript throughout; follow existing patterns.
- Prefer pure functions in `utils/`; keep UI in components/pages.
- Use the shared UI components in `src/components/` and `src/components/ui/`.

## License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers this project.
