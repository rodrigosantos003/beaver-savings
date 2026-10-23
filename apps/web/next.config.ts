import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['savings-core'],

  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://beaver-savings-api.vercel.app/api/auth/:path*',
      },
      {
        source: '/dam',
        destination: 'https://beaver-savings-api.vercel.app/dam',
      },
      {
        source: '/savings',
        destination: 'https://beaver-savings-api.vercel.app/savings',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
