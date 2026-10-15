import { waitUntil } from '@vercel/functions';
import type { Connection } from 'mongoose';
import { sendEmail } from '../../lib/email';
import { buildVerificationEmail } from './verify.email';

const locales = ['en', 'pt'] as const; // adjust to your locales
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
        index, // keeps the original order for equal weights
      };
    })
    .filter(({ lang, q }) => lang && lang !== '*' && q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index)
    .map(({ lang }) => lang);
}

// Returns the first language in the header that is in `supported`.
function primaryLanguage<T extends string>(
  header: string | null | undefined,
  supported: readonly T[],
): T | undefined {
  return parseLanguages(header).find((lang): lang is T =>
    (supported as readonly string[]).includes(lang),
  );
}

// Priority: Content-Language from the web app, then Accept-Language, then default.
export function resolveLocale(request?: Request): Locale {
  return (
    primaryLanguage(request?.headers.get('content-language'), locales) ??
    primaryLanguage(request?.headers.get('accept-language'), locales) ??
    defaultLocale
  );
}

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
      sendVerificationEmail: async ({ user, token }, request) => {
        const locale = resolveLocale(request);

        const url = `${process.env.WEB_ORIGIN}/confirm-account?token=${token}`;

        const { subject, text, html } = buildVerificationEmail(locale, {
          url,
          email: user.email,
          name: user.name,
        });

        waitUntil(
          sendEmail({
            to: user.email,
            subject,
            text,
            html
          }),
        );
      },
      autoSignInAfterVerification: true,
      expiresIn: VERIFICATION_EXPIRES_IN
    },
    advanced: {
      defaultCookieAttributes: {
        sameSite: 'None',
        secure: true,
      },
      ipAddress: {
        ipAddressHeaders: ['x-vercel-forwarded-for', 'x-forwarded-for'],
      }
    },
  });
}
