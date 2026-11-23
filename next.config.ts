import type { NextConfig } from 'next';

import { randomUUID } from 'node:crypto';

import withSerwistInit from '@serwist/next';
import { withRedact } from '@tanstack/redact/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
  // Server-rendered, so they have no build hash; a fresh revision per build re-fetches them.
  additionalPrecacheEntries: ['/offline', '/en/offline'].map((url) => ({
    url,
    revision: randomUUID(),
  })),
  // A blanket reload when the network returns would wipe in-progress input; the offline page reloads itself.
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {};

export default withSerwist(withRedact(withNextIntl(nextConfig)));
