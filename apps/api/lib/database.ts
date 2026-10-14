import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';

@Global()
@Module({
    providers: [
        {
            provide: Connection,
            useFactory: (): Promise<Connection> =>
                createConnection(process.env.MONGODB_URI!, {
                    dbName: 'app',
                    maxPoolSize: 5,
                    serverSelectionTimeoutMS: 5000,
                }).asPromise(),
        },
    ],
    exports: [Connection],
})
export class DatabaseModule implements OnApplicationShutdown {
    constructor(@Inject(Connection) private readonly conn: Connection) { }

    async onApplicationShutdown() {
        await this.conn.close();
    }
}