import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import type { Connection } from 'mongoose';

import { DATABASE_CONNECTION } from '../../lib/database.js';
import { DatabaseModule } from '../../lib/database.js';
import { DamModule } from '../dam/dam.module.js';
import { SavingsModule } from '../savings/savings.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { NotFoundFilter } from './not-found.filter.js';

@Module({})
export class AppModule {
  static async register(): Promise<DynamicModule> {
    const { AuthModule } = await import('@thallesp/nestjs-better-auth');
    const { createAuth } = await import('../auth/auth.js');

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        DatabaseModule,
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
        AuthModule.forRootAsync({
          inject: [DATABASE_CONNECTION],
          useFactory: async (connection: Connection) => ({
            auth: await createAuth(connection),
          }),
        }),
        SavingsModule,
        DamModule,
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
