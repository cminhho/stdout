# Release guide

How to cut a new version and publish the macOS app (GitHub Release + Homebrew Cask).

## Prerequisites

- On `main` (or your release branch) with a clean working tree, or only the changes you intend to release.
- Push access to the repo; tag push triggers the [release-mac](../.github/workflows/release-mac.yml) workflow.

## Steps

1. **Bump version and create tag**

   ```bash
   npm run release        # patch: 1.1.0 → 1.1.1
   npm run release:minor  # minor: 1.1.0 → 1.2.0
   npm run release:major  # major: 1.1.0 → 2.0.0
   ```

   This script:

   - Updates `version` in `package.json`
   - Runs `npm install` (updates `package-lock.json`)
   - Commits with message `chore: release vX.Y.Z`
   - Creates tag `vX.Y.Z`

2. **Push branch and tag**

   The script prints the exact commands. Example:

   ```bash
   git push origin main && git push origin v1.1.1
   ```

3. **GitHub Actions**

   Pushing the tag runs the **Release macOS** workflow: build on `macos-latest`, upload `release/stdout-X.Y.Z-mac.zip` to the [GitHub Release](https://github.com/cminhho/stdout/releases) for that tag.

## Requirements

- `package.json` version must match the tag (e.g. tag `v1.1.0` ↔ `"version": "1.1.0"`). The workflow fails if they differ; the release script keeps them in sync.
- For maintainers: optional repo secret `GH_PAT` (PAT with repo scope) if you need broader release permissions than the default `GITHUB_TOKEN`.

## Troubleshooting

- **403 on “Create GitHub Release”**: The workflow needs `permissions: contents: write` and `generate_release_notes: false`. These are already set in [release-mac.yml](../.github/workflows/release-mac.yml). If a run still fails with 403, the tag may point to an older commit that doesn’t have this workflow. Fix: push the current workflow to `main`, then create a **new** tag from that commit (e.g. `npm run release` → push `main` and `v1.1.1`). The new run will use the fixed workflow.

## After release

- **Homebrew Cask**: If you use a tap (e.g. `cminhho/tap`), update the cask to point at the new release URL/sha.
- **Changelog**: Optionally add release notes in the GitHub Release UI or in a `CHANGELOG.md`.
