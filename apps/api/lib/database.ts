import { Global, Inject, Logger, Module, OnApplicationShutdown } from '@nestjs/common';

import { attachDatabasePool } from '@vercel/functions';
import { Connection, Error, createConnection } from 'mongoose';

const logger = new Logger('MongoDB');

@Global()
@Module({
  providers: [
    {
      provide: Connection,
      useFactory: async (): Promise<Connection> => {
        const conn = createConnection(process.env.MONGODB_URI!, {
          dbName: 'app',
          maxPoolSize: 3,
          minPoolSize: 0,
          maxIdleTimeMS: 30_000,
          serverSelectionTimeoutMS: 5_000,
          connectTimeoutMS: 10_000,
          socketTimeoutMS: 30_000,
          waitQueueTimeoutMS: 5_000,
        });

        const client = conn.getClient();

        attachDatabasePool(client);

        await conn.asPromise();

        // Connection lifecycle
        conn.on('connected', () => logger.log('DB connected'));
        conn.on('disconnected', () => logger.warn('DB disconnected'));
        conn.on('reconnected', () => logger.log('DB reconnected'));
        conn.on('error', (err: Error) => logger.error(`DB error: ${err.message}`));
        conn.on('close', () => logger.warn('DB connection closed'));

        // Pool events
        client.on('connectionCreated', (e) =>
          logger.log(`Pool: socket created (id ${e.connectionId})`),
        );
        client.on('connectionClosed', (e) => logger.log(`Pool: socket closed (${e.reason})`));

        return conn;
      },
    },
  ],
  exports: [Connection],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(Connection) private readonly conn: Connection) {}

  async onApplicationShutdown() {
    await this.conn.close();
  }
}
