import { NextRequest, NextResponse } from 'next/server';

import { getSessionCookie } from 'better-auth/cookies';
import createMiddleware from 'next-intl/middleware';

import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameWithoutLocale =
    pathname.replace(new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`), '') || '/';

  const sessionCookie = getSessionCookie(request);

  const isLandingPage = pathnameWithoutLocale === '/';
  const isLoginPage = pathnameWithoutLocale === '/login' || pathnameWithoutLocale === '/signup';

  if (sessionCookie && (isLandingPage || isLoginPage)) {
    const url = request.nextUrl.clone();

    url.pathname = `/${routing.defaultLocale}/calculator`;

    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
