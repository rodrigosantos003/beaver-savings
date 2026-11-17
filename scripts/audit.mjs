#!/usr/bin/env node
/**
 * `yarn audit --level high` with an allowlist (Yarn 1 has no ignore option).
 *
 * Fails on any high or critical advisory, unless it is listed in .github/audit-allowlist.json
 * with an expiry date that hasn't passed. Expired entries fail the run too, so every exception
 * gets re-reviewed. Allowlisted advisories that no longer show up are reported so they can be
 * removed.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const FAILING = new Set(['high', 'critical']);
const ALLOWLIST_PATH = new URL('../.github/audit-allowlist.json', import.meta.url);

const today = new Date().toISOString().slice(0, 10);
const allowlist = JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8')).advisories;

// Same coverage as a plain `yarn audit` (every dependency group).
const audit = spawnSync('yarn', ['audit', '--json'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  shell: process.platform === 'win32',
});

if (audit.error || !audit.stdout) {
  console.error('Could not run yarn audit.', audit.error ?? audit.stderr);
  process.exit(2);
}

/** GHSA id → advisory, with every dependency path it was found on. */
const found = new Map();
for (const line of audit.stdout.split('\n')) {
  if (!line.trim()) continue;
  const event = JSON.parse(line);
  if (event.type !== 'auditAdvisory') continue;

  const { advisory, resolution } = event.data;
  if (!FAILING.has(advisory.severity)) continue;

  const id = advisory.github_advisory_id ?? String(advisory.id);
  const entry = found.get(id) ?? {
    id,
    module: advisory.module_name,
    severity: advisory.severity,
    title: advisory.title,
    patched: advisory.patched_versions,
    url: advisory.url,
    paths: new Set(),
  };
  entry.paths.add(resolution.path);
  found.set(id, entry);
}

let failed = false;

for (const advisory of found.values()) {
  const allowed = allowlist.find((a) => a.id === advisory.id);
  const paths = [...advisory.paths].map((p) => `    ${p}`).join('\n');

  if (allowed && allowed.expires >= today) {
    console.log(`ALLOWED  ${advisory.id} ${advisory.module} (until ${allowed.expires})`);
    console.log(`  ${allowed.reason}\n${paths}\n`);
    continue;
  }

  failed = true;
  const why = allowed ? `allowlist entry expired on ${allowed.expires}` : advisory.severity;
  console.error(`FAIL     ${advisory.id} ${advisory.module}: ${advisory.title} (${why})`);
  console.error(`  patched: ${advisory.patched} · ${advisory.url}\n${paths}\n`);
}

for (const allowed of allowlist) {
  if (!found.has(allowed.id)) {
    console.log(`STALE    ${allowed.id} no longer reported; remove it from the allowlist.`);
  }
}

console.log(
  failed
    ? '\nHigh/critical advisories need attention.'
    : '\nNo unaccepted high/critical advisories.',
);
process.exit(failed ? 1 : 0);
