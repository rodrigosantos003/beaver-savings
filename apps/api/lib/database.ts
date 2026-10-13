import { Global, Module } from '@nestjs/common';
import { Connection, createConnection } from 'mongoose';

@Global()
@Module({
    providers: [
        {
            provide: Connection, // same token AppService already injects
            useFactory: () => createConnection(process.env.MONGODB_URI!).asPromise(),
        },
    ],
    exports: [Connection],
})
export class DatabaseModule { }