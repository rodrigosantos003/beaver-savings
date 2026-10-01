import { Inject, Injectable } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGO_DB } from '../../lib/database';

export type HealthStatus = 'up' | 'down';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  checks: {
    api: HealthStatus;
    database: HealthStatus;
  };
}

const DB_PING_TIMEOUT_MS = 2000;

@Injectable()
export class AppService {
  constructor(@Inject(MONGO_DB) private readonly db: Db) { }

  async health(): Promise<HealthCheckResult> {
    const database = await this.checkDatabase();

    return {
      status: database === 'up' ? 'ok' : 'error',
      checks: { api: 'up', database },
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    let timer: NodeJS.Timeout | undefined;

    try {
      await Promise.race([
        this.db.command({ ping: 1 }),
        new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error('Database ping timed out')),
            DB_PING_TIMEOUT_MS,
          );
        }),
      ]);
      return 'up';
    } catch {
      return 'down';
    } finally {
      clearTimeout(timer);
    }
  }
}