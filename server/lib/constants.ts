import 'server-only';

import { SITE_URL } from '@/lib/constants';

/**
 * Origin this deployment is served from, used for Better Auth and for links in emails.
 * Production uses the public site URL, previews their own deployment URL, and local dev
 * localhost. `APP_URL` overrides all of them.
 */
export const APP_URL = (
  process.env.APP_URL ??
  (process.env.VERCEL_ENV === 'production'
    ? SITE_URL
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')
).replace(/\/+$/, '');
