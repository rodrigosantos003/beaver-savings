import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export type HealthStatus = 'up' | 'down';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  checks: {
    api: HealthStatus;
    database: HealthStatus;
  };
}

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async health(): Promise<HealthCheckResult> {
    const database = await this.checkDatabase();

    return {
      status: database === 'up' ? 'ok' : 'error',
      checks: {
        api: 'up',
        database,
      },
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      if (this.connection.readyState !== 1 || !this.connection.db) {
        return 'down';
      }

      await this.connection.db.admin().ping();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
