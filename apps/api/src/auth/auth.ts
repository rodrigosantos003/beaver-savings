import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { mongoClient, mongoDb } from '../../lib/database';

export const auth = betterAuth({
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