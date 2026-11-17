import 'server-only';

import { getDb } from '@/server/db/connection';

import { tooManyRequests } from './errors';

type Bucket = { _id: string; count: number; expiresAt: Date };

const COLLECTION = 'api_rate_limits';

/** Created once per instance; the TTL index lets MongoDB drop expired windows on its own. */
const globalForLimits = globalThis as typeof globalThis & { __rateLimitIndex?: Promise<unknown> };

function buckets() {
  const collection = getDb().collection<Bucket>(COLLECTION);
  globalForLimits.__rateLimitIndex ??= collection
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'ttl_expiresAt' })
    .catch((error: unknown) => {
      globalForLimits.__rateLimitIndex = undefined;
      console.error('[rate-limit] could not create TTL index', error);
    });
  return collection;
}

export type RateLimit = { limit: number; windowMs?: number };

/**
 * Fixed-window limiter stored in MongoDB, so the count is shared by every serverless instance
 * (an in-memory counter would reset on each cold start). Throws a 429 once `limit` is exceeded.
 */
export async function enforceRateLimit(key: string, { limit, windowMs = 60_000 }: RateLimit) {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);

  const bucket = await buckets().findOneAndUpdate(
    { _id: `${key}:${windowStart}` },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
    { upsert: true, returnDocument: 'after' },
  );

  if ((bucket?.count ?? 0) > limit) {
    throw tooManyRequests(Math.ceil((expiresAt.getTime() - now) / 1000));
  }
}
