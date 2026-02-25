#!/usr/bin/env node
/**
 * Bump version, update lockfile, commit (message: release: vX.Y.Z), create tag.
 * Push branch + tag to trigger GitHub Release (release-mac workflow); release body is generated from commits since previous tag.
 * Usage: node scripts/release.mjs [patch|minor|major]   (default: patch)
 */

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pkgPath = join(root, 'package.json');

const level = (process.argv[2] || 'patch').toLowerCase();
if (!['patch', 'minor', 'major'].includes(level)) {
  console.error('Usage: node scripts/release.mjs [patch|minor|major]');
  process.exit(1);
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const [major, minor, patch] = pkg.version.split('.').map(Number);

let next;
if (level === 'major') next = `${major + 1}.0.0`;
else if (level === 'minor') next = `${major}.${minor + 1}.0`;
else next = `${major}.${minor}.${patch + 1}`;

pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`Bumped package.json to ${next}`);

execSync('npm install', { cwd: root, stdio: 'inherit' });
execSync('git add package.json package-lock.json', { cwd: root, stdio: 'inherit' });
execSync(`git commit -m "release: v${next}"`, { cwd: root, stdio: 'inherit' });
execSync(`git tag v${next}`, { cwd: root, stdio: 'inherit' });

const branch = execSync('git branch --show-current', { cwd: root, encoding: 'utf8' }).trim();
console.log('\nDone. Push to trigger GitHub Release:');
console.log(`  git push origin ${branch} && git push origin v${next}`);
