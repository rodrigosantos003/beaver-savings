import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
    ];
  },
};

export default withNextIntl(nextConfig);
