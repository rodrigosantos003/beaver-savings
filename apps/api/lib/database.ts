import { Db, MongoClient } from 'mongodb';
import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

export const DB_NAME = 'app';

export const mongoClient = new MongoClient(
  process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
  { serverSelectionTimeoutMS: 5000 },
);

export const mongoDb = mongoClient.db(DB_NAME);

export const MONGO_CLIENT = Symbol('MONGO_CLIENT');
export const MONGO_DB = Symbol('MONGO_DB');

@Injectable()
class DatabaseLifecycle implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger('MongoDB');

  constructor(
    @Inject(MONGO_CLIENT) private readonly client: MongoClient,
    @Inject(MONGO_DB) private readonly db: Db,
  ) {}

  async onModuleInit() {
    await this.client.connect();
    await this.db.command({ ping: 1 });

    const { srvHost, hosts } = this.client.options;
    const target =
      srvHost ?? hosts.map((h) => `${h.host}:${h.port}`).join(', ');

    this.logger.log(
      `Connected -> host(s): ${target}, database: "${this.db.databaseName}"`,
    );

    this.client.on('serverHeartbeatFailed', (e) =>
      this.logger.warn(`Heartbeat failed for ${e.connectionId}`),
    );
  }

  async onApplicationShutdown() {
    await this.client.close();
    this.logger.log('Connection closed');
  }
}

@Global()
@Module({
  providers: [
    { provide: MONGO_CLIENT, useValue: mongoClient },
    { provide: MONGO_DB, useValue: mongoDb },
    DatabaseLifecycle,
  ],
  exports: [MONGO_CLIENT, MONGO_DB],
})
export class DatabaseModule {}
