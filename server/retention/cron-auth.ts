import { createHash, timingSafeEqual } from 'node:crypto';

import 'server-only';

const digest = (value: string) => createHash('sha256').update(value).digest();

/** The scheduler calls the endpoint with `Authorization: Bearer $CRON_SECRET`. */
export function isAuthorizedCron(authorization: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !authorization) return false;
  // Hash both sides so the comparison is constant-time regardless of length.
  return timingSafeEqual(digest(authorization), digest(`Bearer ${secret}`));
}
