import { NextRequest, NextResponse } from 'next/server';

import { getSessionCookie } from 'better-auth/cookies';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const localePattern = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

const AUTH_PAGES = ['/login', '/signup'];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const locale = pathname.match(localePattern)?.[1] ?? routing.defaultLocale;
  const path = pathname.replace(localePattern, '') || '/';

  const hasSession = !!getSessionCookie(request);

  const isLanding = path === '/';
  const isAuthPage = AUTH_PAGES.includes(path);

  if (hasSession && (isLanding || isAuthPage)) {
    return NextResponse.redirect(new URL(`/${locale}/calculator`, request.url));
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
