import { Inject, Injectable } from '@nestjs/common';
import { Connection } from 'mongoose';

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
  // Provided by DatabaseModule under the mongoose `Connection` class token.
  constructor(@Inject(Connection) private readonly connection: Connection) { }

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
      const db = this.connection.db;
      if (!db) return 'down';

      await Promise.race([
        db.command({ ping: 1 }),
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