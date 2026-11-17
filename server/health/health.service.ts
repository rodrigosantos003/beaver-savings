import 'server-only';

import { getDb } from '@/server/db/connection';

export type HealthStatus = 'up' | 'down';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  checks: {
    api: HealthStatus;
    database: HealthStatus;
  };
}

const DB_PING_TIMEOUT_MS = 2000;

export async function health(): Promise<HealthCheckResult> {
  const database = await checkDatabase();

  return {
    status: database === 'up' ? 'ok' : 'error',
    checks: { api: 'up', database },
  };
}

async function checkDatabase(): Promise<HealthStatus> {
  let timer: NodeJS.Timeout | undefined;

  try {
    await Promise.race([
      getDb().command({ ping: 1 }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Database ping timed out')), DB_PING_TIMEOUT_MS);
      }),
    ]);
    return 'up';
  } catch {
    return 'down';
  } finally {
    clearTimeout(timer);
  }
}
