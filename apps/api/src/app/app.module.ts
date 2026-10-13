import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import type { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SavingsModule } from '../savings/savings.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { NotFoundFilter } from './not-found.filter';
import { ResultsModule } from '../results/results.module';
import { DamModule } from '../dam/dam.module';

@Module({})
export class AppModule {
  static async register(): Promise<DynamicModule> {
    // ESM-only packages: keep these as dynamic imports
    const { AuthModule } = await import('@thallesp/nestjs-better-auth');
    const { createAuth } = await import('../auth/auth.js');
    const { getConnectionToken, MongooseModule } = await import('@nestjs/mongoose');

    const dbLogger = new Logger('MongoDB');

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            uri: config.get('MONGODB_URI') ?? 'mongodb://localhost:27017',
            dbName: 'app',
            serverSelectionTimeoutMS: 5000,
            onConnectionCreate: (connection: Connection) => {
              connection.on('connected', () =>
                dbLogger.log(
                  `Connected ~ Host: ${connection.host}:${connection.port} ~ Database: "${connection.name}"`,
                ),
              );
              connection.on('disconnected', () =>
                dbLogger.warn('Disconnected'),
              );
              connection.on('error', (err) =>
                dbLogger.error(`Error: ${err.message}`),
              );

              connection
                .getClient()
                .on('serverHeartbeatFailed', (e) =>
                  dbLogger.warn(`Heartbeat failed for ${e.connectionId}`),
                );

              return connection;
            },
          }),
        }),
        ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
        AuthModule.forRootAsync({
          inject: [getConnectionToken()],
          useFactory: async (connection: Connection) => ({
            auth: await createAuth(connection),
          }),
        }),
        SavingsModule,
        ResultsModule,
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
