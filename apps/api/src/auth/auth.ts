import { waitUntil } from '@vercel/functions';
import type { Connection } from 'mongoose';
import { sendEmail } from '../../lib/email';

export async function createAuth(connection: Connection) {
  // better-auth is ESM-only. Nest emits CommonJS, and a static import
  // becomes require(), which crashes the Vercel function before it can
  // answer the browser's CORS preflight.
  const { betterAuth } = await import('better-auth');
  const { mongodbAdapter } = await import('better-auth/adapters/mongodb');

  const db = connection.db;
  const client = connection.getClient();
  if (!db || !client) throw new Error('Mongoose connection is not ready');

  return betterAuth({
    database: mongodbAdapter(db, {
      client: client,
      usePlural: true,
    }),
    user: {
      deleteUser: {
        enabled: true,
        afterDelete: async (user) => {
          const query = { userId: user.id };

          await db.collection('results').deleteMany(query);
          await db.collection('dam_entries').deleteMany(query);
        },
      },
    },
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4331',
    secret: process.env.BETTER_AUTH_SECRET ?? 'secret',
    trustedOrigins: [process.env.WEB_ORIGIN ?? 'http://localhost:3000'],
    emailAndPassword: { enabled: true },
    emailVerification: {
      sendVerificationEmail: async ({ user, token }) => {
        const url = `${process.env.WEB_ORIGIN}/confirm-account?token=${token}`;

        waitUntil(
          sendEmail({
            to: user.email,
            subject: 'Confirm Beaver Savings account',
            text: `Welcome to Beaver Savings! To confirm your account, please use the following link: ${url}`,
          }),
        );
      },
      autoSignInAfterVerification: true,
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'None',
        secure: true,
      },
    },
  });
}
