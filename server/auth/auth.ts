import { after } from 'next/server';

import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';
import 'server-only';

import { routing } from '@/i18n/routing';
import { getConnection, getDb } from '@/server/db/connection';
import { APP_URL } from '@/server/lib/constants';
import { sendEmail } from '@/server/lib/email';
import { toObjectId } from '@/server/lib/object-id';
import { CURRENCIES } from '@/shared/currency';

import { buildResetPasswordEmail } from './emails/recover.email';
import { buildVerificationEmail } from './emails/verify.email';

type Locale = (typeof routing.locales)[number];
const defaultLocale: Locale = 'en';

const VERIFICATION_EXPIRES_IN = 60 * 60 * 24; // seconds (24 hours)

function parseLanguages(header?: string | null): string[] {
  if (!header) return [];

  return header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;
      return {
        lang: tag.trim().split(/[-_]/)[0].toLowerCase(),
        q: Number.isNaN(q) ? 0 : q,
        index,
      };
    })
    .filter(({ lang, q }) => lang && lang !== '*' && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ lang }) => lang);
}

function primaryLanguage(header: string | null | undefined): Locale | undefined {
  return parseLanguages(header).find((lang): lang is Locale =>
    (routing.locales as readonly string[]).includes(lang),
  );
}

export function resolveLocale(request?: Request): Locale {
  return (
    primaryLanguage(request?.headers.get('content-language')) ??
    primaryLanguage(request?.headers.get('accept-language')) ??
    defaultLocale
  );
}

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('BETTER_AUTH_SECRET must be configured securely');
  }

  const db = getDb();

  /** Feeds the inactive-account retention job (see server/retention). */
  const touchLastActive = async (session: { userId: string }) => {
    await db
      .collection('users')
      .updateOne(
        { _id: toObjectId(session.userId, 'userId') },
        { $set: { lastActiveAt: new Date() } },
      );
  };

  return betterAuth({
    database: mongodbAdapter(db, {
      client: getConnection().getClient(),
      usePlural: true,
    }),
    user: {
      deleteUser: {
        enabled: true,
        afterDelete: async (user) => {
          const query = { userId: toObjectId(user.id, 'userId') };

          await Promise.all([
            db.collection('dam_entries').deleteMany(query),
            db.collection('calculator_snapshots').deleteMany(query),
          ]);
        },
      },
      additionalFields: {
        preferredCurrency: {
          type: [...(CURRENCIES as readonly string[])],
          required: true,
          input: true,
          defaultValue: 'EUR',
        },
      },
    },
    databaseHooks: {
      session: {
        // Sign-in creates a session; while the user stays active it is refreshed (updateAge).
        create: { after: touchLastActive },
        update: { after: touchLastActive },
      },
    },
    baseURL: APP_URL,
    secret,
    trustedOrigins: [APP_URL],
    emailAndPassword: {
      enabled: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, token }, request) => {
        const { subject, text, html } = buildResetPasswordEmail(resolveLocale(request), {
          url: `${APP_URL}/reset-password?token=${token}`,
          email: user.email,
          name: user.name,
        });

        after(() => sendEmail({ to: user.email, subject, text, html }));

        return Promise.resolve();
      },
    },
    emailVerification: {
      sendVerificationEmail: ({ user, token }, request) => {
        const { subject, text, html } = buildVerificationEmail(resolveLocale(request), {
          url: `${APP_URL}/confirm-account?token=${token}`,
          email: user.email,
          name: user.name,
        });

        after(() => sendEmail({ to: user.email, subject, text, html }));

        return Promise.resolve();
      },
      autoSignInAfterVerification: true,
      expiresIn: VERIFICATION_EXPIRES_IN,
    },
    advanced: {
      ipAddress: {
        ipAddressHeaders: ['x-vercel-forwarded-for', 'x-forwarded-for'],
      },
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      storage: 'database',
      modelName: 'rateLimit',
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      freshAge: 60 * 60 * 24, // 1 day
    },
    // Lets auth.api calls made from server actions set cookies; must stay the last plugin.
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as typeof globalThis & { __auth?: Auth };

/** Created on first use, so `next build` can import route modules without env or database. */
export function getAuth(): Auth {
  return (globalForAuth.__auth ??= createAuth());
}
