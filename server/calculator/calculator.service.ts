import { isDeepStrictEqual } from 'node:util';

import 'server-only';

import { toObjectId } from '@/server/lib/object-id';
import type { SavingsInput } from '@/shared/savings/types';

import * as repo from './calculator.repository';

const SCHEMA_VERSION = 1;
const MAX_SNAPSHOTS_PER_USER = 100;
const HABITS_WINDOW = 30;
const HABITS_MIN_SAMPLES = 3;

export type HabitsResponse = {
  samples: number;
  medianSavingsPercent: number | null;
  medianSavingsAmount: number | null;
  medianMonthlyExpenses: number | null;
  preferredMethod: 'percent' | 'fixed' | null;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const result = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(result * 100) / 100;
}

export async function save(userId: string, input: SavingsInput): Promise<void> {
  const uid = toObjectId(userId, 'userId');

  const [last] = await repo.findRecentByUserId(uid, 1);
  if (last && isDeepStrictEqual(last.input, input)) return;

  await repo.create({ userId: uid, input, schemaVersion: SCHEMA_VERSION });
  await repo.pruneKeepingLatest(uid, MAX_SNAPSHOTS_PER_USER);
}

export async function getLatest(userId: string): Promise<{ input: SavingsInput | null }> {
  const [last] = await repo.findRecentByUserId(toObjectId(userId, 'userId'), 1);
  return { input: last?.input ?? null };
}

export async function getHabits(userId: string): Promise<HabitsResponse> {
  const docs = await repo.findRecentByUserId(toObjectId(userId, 'userId'), HABITS_WINDOW);
  const inputs = docs.map((d) => d.input);

  if (inputs.length < HABITS_MIN_SAMPLES) {
    return {
      samples: inputs.length,
      medianSavingsPercent: null,
      medianSavingsAmount: null,
      medianMonthlyExpenses: null,
      preferredMethod: null,
    };
  }

  const percentUsers = inputs.filter((i) => i.savingsMethod === 'percent');
  const fixedUsers = inputs.filter((i) => i.savingsMethod === 'fixed');

  return {
    samples: inputs.length,
    medianSavingsPercent: median(percentUsers.map((i) => i.savingsPercent)),
    medianSavingsAmount: median(fixedUsers.map((i) => i.savingsAmount)),
    medianMonthlyExpenses: median(inputs.map((i) => i.monthlyExpenses)),
    preferredMethod: percentUsers.length >= fixedUsers.length ? 'percent' : 'fixed',
  };
}

export async function clear(userId: string): Promise<void> {
  await repo.deleteAllByUserId(toObjectId(userId, 'userId'));
}
