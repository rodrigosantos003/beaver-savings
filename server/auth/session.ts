import { headers } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import { cache } from 'react';

import 'server-only';

import { unauthorized } from '@/server/lib/errors';

import { type Auth, getAuth } from './auth';

export type Session = NonNullable<Awaited<ReturnType<Auth['api']['getSession']>>>;
export type SessionUser = Session['user'];

/** Current session, or null. Deduplicated per request, so pages and layouts can all call it. */
export const getSession = cache(async (): Promise<Session | null> => {
  // Outside the try: reading headers is what marks the page as dynamic, and Next signals that
  // by throwing, so it must not be swallowed.
  const requestHeaders = await headers();
  try {
    return await getAuth().api.getSession({ headers: requestHeaders });
  } catch (error) {
    unstable_rethrow(error);
    console.error('[auth] getSession failed', error);
    return null;
  }
});

/** The signed-in user, or a 401. */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) throw unauthorized();
  return session.user;
}
