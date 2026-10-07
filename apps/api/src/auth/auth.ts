import { waitUntil } from '@vercel/functions';
import { mongoClient, mongoDb } from '../../lib/database';
import { sendEmail } from '../../lib/email';

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
      deleteUser: {
        enabled: true,
        afterDelete: async (user) => {
          const query = { userId: user.id };

          await mongoDb.collection('results').deleteMany(query);
          await mongoDb.collection('dam_entries').deleteMany(query);
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
