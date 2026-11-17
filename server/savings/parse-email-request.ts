import { BadRequestException } from '@nestjs/common';

import { SavingsInput, SavingsMethod } from 'savings-core';

export interface SavingsEmailRequest {
  to: string;
  locale: 'pt' | 'en';
  input: SavingsInput;
}

const NUMBER_FIELDS = [
  'netSalary',
  'holidaySubsidyNet',
  'christmasSubsidyNet',
  'holidayMonth',
  'christmasMonth',
  'extras',
  'monthlyExpenses',
  'savingsPercent',
  'savingsAmount',
] as const;

const BOOLEAN_FIELDS = ['includeSubsidies', 'includeExtras', 'subsidiesInTwelfths'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readNumber(body: Record<string, unknown>, field: string): number {
  const value = body[field];

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new BadRequestException(`${field} must be a finite number`);
  }

  return value;
}

function readBoolean(body: Record<string, unknown>, field: string): boolean {
  const value = body[field];

  if (typeof value !== 'boolean') {
    throw new BadRequestException(`${field} must be a boolean`);
  }

  return value;
}

export function parseEmailRequest(body: unknown): SavingsEmailRequest {
  if (!isRecord(body)) {
    throw new BadRequestException('Invalid body');
  }

  if (typeof body.to !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.to)) {
    throw new BadRequestException('Invalid email address');
  }

  if (body.locale !== undefined && body.locale !== 'pt' && body.locale !== 'en') {
    throw new BadRequestException('locale must be pt or en');
  }

  if (body.savingsMethod !== 'percent' && body.savingsMethod !== 'fixed') {
    throw new BadRequestException('savingsMethod must be percent or fixed');
  }

  const savingsMethod: SavingsMethod = body.savingsMethod;
  const input: SavingsInput = {
    savingsMethod,
    includeSubsidies: false,
    includeExtras: false,
    subsidiesInTwelfths: false,
    netSalary: 0,
    holidaySubsidyNet: 0,
    christmasSubsidyNet: 0,
    holidayMonth: 0,
    christmasMonth: 0,
    extras: 0,
    monthlyExpenses: 0,
    savingsPercent: 0,
    savingsAmount: 0,
  };

  for (const field of NUMBER_FIELDS) {
    input[field] = readNumber(body, field);
  }

  for (const field of BOOLEAN_FIELDS) {
    input[field] = readBoolean(body, field);
  }

  return {
    to: body.to,
    locale: body.locale === 'en' ? 'en' : 'pt',
    input,
  };
}
