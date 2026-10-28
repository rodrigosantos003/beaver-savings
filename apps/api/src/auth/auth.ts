import { waitUntil } from '@vercel/functions';
import type { Connection } from 'mongoose';
import { CURRENCIES } from 'savings-core';

import { sendEmail } from '../../lib/email.js';
import { buildResetPasswordEmail } from './recover.email.js';
import { buildVerificationEmail } from './verify.email.js';

const locales = ['en', 'pt'] as const;
type Locale = (typeof locales)[number];
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

function primaryLanguage<T extends string>(
  header: string | null | undefined,
  supported: readonly T[],
): T | undefined {
  return parseLanguages(header).find((lang): lang is T =>
    (supported as readonly string[]).includes(lang),
  );
}

export function resolveLocale(request?: Request): Locale {
  return (
    primaryLanguage(request?.headers.get('content-language'), locales) ??
    primaryLanguage(request?.headers.get('accept-language'), locales) ??
    defaultLocale
  );
}

export async function createAuth(connection: Connection) {
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

          await db.collection('dam_entries').deleteMany(query);
          await db.collection('calculator_snapshots').deleteMany(query);
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
    baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:4331',
    secret: process.env.BETTER_AUTH_SECRET ?? 'secret',
    trustedOrigins: [process.env.WEB_ORIGIN ?? 'http://localhost:3000'],
    emailAndPassword: {
      enabled: true,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: ({ user, token }, request) => {
        const locale = resolveLocale(request);

        const url = `${process.env.WEB_ORIGIN}/reset-password?token=${token}`;

        const { subject, text, html } = buildResetPasswordEmail(locale, {
          url,
          email: user.email,
          name: user.name,
        });

        waitUntil(sendEmail({ to: user.email, subject, text, html }));

        return Promise.resolve();
      },
    },
    emailVerification: {
      sendVerificationEmail: ({ user, token }, request) => {
        const locale = resolveLocale(request);

        const url = `${process.env.WEB_ORIGIN}/confirm-account?token=${token}`;

        const { subject, text, html } = buildVerificationEmail(locale, {
          url,
          email: user.email,
          name: user.name,
        });

        waitUntil(sendEmail({ to: user.email, subject, text, html }));

        return Promise.resolve();
      },
      autoSignInAfterVerification: true,
      expiresIn: VERIFICATION_EXPIRES_IN,
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'None',
        secure: true,
      },
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
  });
}
