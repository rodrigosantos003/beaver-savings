import 'server-only';

import { getSession } from '@/server/auth/session';
import * as dam from '@/server/dam/dam.service';

import * as calculator from './calculator.service';

/** Resolves to null on any failure, so a data hiccup renders the page without saved data. */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/** Everything the calculator page needs for the signed-in user, read straight from the services. */
export async function getCalculatorPageData() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return { user: null, savedInput: null, habits: null, damEntries: null };
  }

  const [latest, habits, damState] = await Promise.all([
    orNull(calculator.getLatest(user.id)),
    orNull(calculator.getHabits(user.id)),
    orNull(dam.list(user.id)),
  ]);

  return {
    user,
    savedInput: latest?.input ?? null,
    habits,
    damEntries: damState?.entries ?? null,
  };
}
