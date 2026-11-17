import { isDeepStrictEqual } from 'node:util';

import { BadRequestException, Injectable } from '@nestjs/common';

import { Types } from 'mongoose';
import type { SavingsInput } from 'savings-core';

import { SaveCalculatorInputDto } from './calculator.dto.js';
import { CalculatorRepository } from './calculator.repository.js';

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

function toObjectId(value: string, field: string): Types.ObjectId {
  if (!/^[a-f\d]{24}$/i.test(value ?? '')) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return new Types.ObjectId(value);
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const result = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(result * 100) / 100;
}

@Injectable()
export class CalculatorService {
  constructor(private readonly repo: CalculatorRepository) {}

  async save(userId: string, dto: SaveCalculatorInputDto): Promise<void> {
    const uid = toObjectId(userId, 'userId');
    const input: SavingsInput = { ...dto }; // plain object, not a DTO class instance

    const [last] = await this.repo.findRecentByUserId(uid, 1);
    if (last && isDeepStrictEqual(last.input, input)) return;

    await this.repo.create({ userId: uid, input, schemaVersion: SCHEMA_VERSION });
    await this.repo.pruneKeepingLatest(uid, MAX_SNAPSHOTS_PER_USER);
  }

  async getLatest(userId: string): Promise<{ input: SavingsInput | null }> {
    const [last] = await this.repo.findRecentByUserId(toObjectId(userId, 'userId'), 1);
    return { input: last?.input ?? null };
  }

  async getHabits(userId: string): Promise<HabitsResponse> {
    const docs = await this.repo.findRecentByUserId(toObjectId(userId, 'userId'), HABITS_WINDOW);
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

  async clear(userId: string): Promise<void> {
    await this.repo.deleteAllByUserId(toObjectId(userId, 'userId'));
  }
}
