import { attachDatabasePool } from '@vercel/functions';
import mongoose, { type Connection, type Model, type Schema } from 'mongoose';
import 'server-only';

const DB_NAME = process.env.DB_NAME ?? 'dev';

/**
 * One connection per server instance, kept on `globalThis` so it survives dev hot reloads and is
 * reused by every request a warm serverless instance handles. It is created lazily, so importing
 * this module (e.g. while `next build` collects route config) never opens a socket.
 */
const globalForDb = globalThis as typeof globalThis & { __mongoConnection?: Connection };

function createConnection(): Connection {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  const conn = mongoose.createConnection(uri, {
    dbName: DB_NAME,
    // One instance serves concurrent pages, auth and API calls, and Better Auth starts ~10 index
    // builds at once on a cold start; 3 sockets ran out and requests hit the wait-queue timeout.
    maxPoolSize: 10,
    minPoolSize: 0,
    maxIdleTimeMS: 30_000,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 30_000,
    waitQueueTimeoutMS: 10_000,
  });

  // Lets Vercel Fluid compute close idle sockets before an instance is suspended.
  attachDatabasePool(conn.getClient());

  conn.on('disconnected', () => console.warn('[mongo] disconnected'));
  conn.on('reconnected', () => console.log('[mongo] reconnected'));
  conn.on('error', (err: Error) => console.error(`[mongo] ${err.message}`));

  return conn;
}

/** The shared Mongoose connection. Queries issued before it is open are buffered by Mongoose. */
export function getConnection(): Connection {
  return (globalForDb.__mongoConnection ??= createConnection());
}

/**
 * Raw driver access for collections Mongoose does not model (Better Auth's users, sessions, …).
 * The driver connects on first use, so this is safe to call synchronously.
 */
export function getDb() {
  return getConnection().getClient().db(DB_NAME);
}

/** Registers a model once per connection; re-evaluated modules (hot reload) reuse it. */
export function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  const conn = getConnection();
  return (conn.models[name] as Model<T> | undefined) ?? conn.model<T>(name, schema);
}
