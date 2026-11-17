import type { NextConfig } from 'next';

import withSerwistInit from '@serwist/next';
import { withRedact } from '@tanstack/redact/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV !== 'production',
});

const nextConfig: NextConfig = {};

export default withSerwist(withRedact(withNextIntl(nextConfig)));
