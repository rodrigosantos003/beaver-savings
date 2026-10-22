import { NextRequest, NextResponse } from 'next/server';

import { getSessionCookie } from 'better-auth/cookies';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const localePattern = new RegExp(
  `^/(${routing.locales
    .map((locale) => locale.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})(?=/|$)`,
);

const AUTH_PAGES = ['/login', '/signup'];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const localeMatch = pathname.match(localePattern);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const path = pathname.replace(localePattern, '') || '/';

  const sessionCookie = getSessionCookie(request);
  const hasSession = Boolean(sessionCookie);

  console.log('[proxy auth]', {
    pathname,
    path,
    locale,
    hasSession,
  });

  if (hasSession && (path === '/' || AUTH_PAGES.includes(path))) {
    return NextResponse.redirect(new URL(`/${locale}/calculator`, request.url));
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
