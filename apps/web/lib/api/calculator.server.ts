import { cache } from 'react';

import type { SavingsInput } from 'savings-core';
import 'server-only';

import type { CalculatorHabits, CalculatorLatest } from './calculator';
import { DamEntry } from './dam';
import { serverRequest } from './server';

export type ServerSession = {
  user: {
    id: string;
    preferredCurrency?: string | null;
  };
} | null;

/** Resolves to null on any failure, so a bad response just means "anonymous" / "no data". */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

/** Better Auth returns `null` with a 200 when there is no session. */
export const getServerSession = cache(() =>
  orNull(serverRequest<ServerSession>('/api/auth/get-session')),
);

export const getLatestCalculatorInputServer = cache(async (): Promise<SavingsInput | null> => {
  const res = await orNull(serverRequest<CalculatorLatest>('/snapshots/latest'));
  return res?.input ?? null;
});

export const getCalculatorHabitsServer = cache(() =>
  orNull(serverRequest<CalculatorHabits>('/snapshots/habits')),
);

/** Everything the calculator page needs, in one parallel pass. */
export async function getCalculatorPageData() {
  const session = await getServerSession();
  const userId = session?.user.id;

  if (!userId) {
    return { userId: undefined, preferredCurrency: null, savedInput: null, habits: null };
  }

  const [savedInput, habits] = await Promise.all([
    getLatestCalculatorInputServer(),
    getCalculatorHabitsServer(),
  ]);

  return {
    userId,
    preferredCurrency: session?.user.preferredCurrency ?? null,
    savedInput,
    habits,
  };
}

export const getDamServer = cache(async (): Promise<DamEntry[] | null> => {
  const res = await orNull(serverRequest<{ entries: DamEntry[] }>('/dam'));
  return res?.entries ?? null;
});
