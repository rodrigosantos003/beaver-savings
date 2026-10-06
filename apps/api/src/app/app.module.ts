import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SavingsModule } from '../savings/savings.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { NotFoundFilter } from './not-found.filter';
import { DatabaseModule } from '../../lib/database';
import { ResultsModule } from '../results/results.module';
import { DamModule } from '../dam/dam.module';

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
        AuthModule.forRoot({
          auth: await createAuth(),
        }),
        SavingsModule,
        ResultsModule,
        DamModule
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        {
          provide: APP_FILTER,
          useClass: NotFoundFilter,
        },
      ],
    };
  }
}
