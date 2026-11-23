import type { NextConfig } from 'next';

import { createHash, randomUUID } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import withSerwistInit from '@serwist/next';
import { withRedact } from '@tanstack/redact/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const PUBLIC_DIR = 'public';
const SW_OUTPUT = /^(sw\.js(\.map)?|swe-worker-.*\.js)$/;

/**
 * Top-level public files (icons, logo) for the offline precache. Setting
 * additionalPrecacheEntries makes Serwist skip its own public/ scan, so it is done here.
 * Subfolders stay out: each device needs only one of the iOS launch images (public/splash)
 * and none of the install-dialog screenshots (public/screenshots).
 */
const publicPrecacheEntries = readdirSync(PUBLIC_DIR, { withFileTypes: true })
  .filter((entry) => entry.isFile() && !SW_OUTPUT.test(entry.name))
  .map(({ name }) => ({
    url: `/${name}`,
    revision: createHash('md5')
      .update(readFileSync(join(PUBLIC_DIR, name)))
      .digest('hex'),
  }));

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
  additionalPrecacheEntries: [
    ...publicPrecacheEntries,
    // Server-rendered, so they have no build hash; a fresh revision per build re-fetches them.
    ...['/offline', '/en/offline'].map((url) => ({ url, revision: randomUUID() })),
  ],
  // A blanket reload when the network returns would wipe in-progress input; the offline page reloads itself.
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {};

export default withSerwist(withRedact(withNextIntl(nextConfig)));
