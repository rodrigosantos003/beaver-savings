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

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4331';

const nextConfig: NextConfig = {
  transpilePackages: ['savings-core'],

  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${apiUrl}/api/auth/:path*`,
      },
      {
        source: '/dam',
        destination: `${apiUrl}/dam`,
      },
      {
        source: '/dam/:path*',
        destination: `${apiUrl}/dam/:path*`,
      },
      {
        source: '/savings',
        destination: `${apiUrl}/savings`,
      },
      {
        source: '/savings/:path*',
        destination: `${apiUrl}/savings/:path*`,
      },
      {
        source: '/snapshots/:path*',
        destination: `${apiUrl}/snapshots/:path*`,
      },
    ];
  },
};

export default withSerwist(withRedact(withNextIntl(nextConfig)));
