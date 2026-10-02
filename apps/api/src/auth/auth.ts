import { mongoClient, mongoDb } from '../../lib/database';

export async function createAuth() {
  // better-auth is ESM-only. Nest emits CommonJS, and a static import
  // becomes require(), which crashes the Vercel function before it can
  // answer the browser's CORS preflight.
  const { betterAuth } = await import('better-auth');
  const { mongodbAdapter } = await import('better-auth/adapters/mongodb');

  return betterAuth({
    database: mongodbAdapter(mongoDb, {
      client: mongoClient,
      usePlural: true,
    }),
    user: {
      additionalFields: {
        isSystemUser: {
          type: 'boolean',
          defaultValue: false,
          input: false,
        },
      },
    },
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4331',
    secret: process.env.BETTER_AUTH_SECRET ?? 'secret',
    trustedOrigins: [process.env.WEB_ORIGIN ?? 'http://localhost:3000'],
    emailAndPassword: { enabled: true },
    email: {
      from: process.env.RESEND_FROM ?? 'no-reply@example.com',
    },
  });
}