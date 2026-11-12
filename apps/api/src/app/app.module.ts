import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ResilienceModule } from '@nestjs/resilience';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import type { Connection } from 'mongoose';

import { DATABASE_CONNECTION } from '../../lib/database.js';
import { DatabaseModule } from '../../lib/database.js';
import { AccountModule } from '../account/account.module.js';
import { CalculatorModule } from '../calculator/calculator.module.js';
import { CoachModule } from '../coach/coach.module.js';
import { DamModule } from '../dam/dam.module.js';
import { RetentionModule } from '../retention/retention.module.js';
import { SavingsModule } from '../savings/savings.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NotFoundFilter } from './not-found.filter.js';

@Module({})
export class AppModule {
  static async register(): Promise<DynamicModule> {
    const [{ AuthModule }, { createAuth }] = await Promise.all([
      import('@thallesp/nestjs-better-auth'),
      import('../auth/auth.js'),
    ]);

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
          cache: true,
          ignoreEnvFile: process.env.VERCEL === '1',
        }),
        DatabaseModule,
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
        AuthModule.forRootAsync({
          inject: [DATABASE_CONNECTION],
          useFactory: async (connection: Connection) => ({
            auth: await createAuth(connection),
          }),
        }),
        ResilienceModule.forRoot({
          presets: {
            carrier: {
              timeout: '2s',
              retry: { attempts: 2 },
              circuitBreaker: { failureRateThreshold: 50, minimumCalls: 10, openDuration: '30s' },
            },
          },
        }),
        SavingsModule,
        DamModule,
        CalculatorModule,
        CoachModule,
        AccountModule,
        RetentionModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: APP_FILTER, useClass: NotFoundFilter },
      ],
    };
  }
}
