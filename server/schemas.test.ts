import { describe, expect, it } from 'vitest';

import { saveCalculatorInputSchema } from './calculator/calculator.schema';
import { askCoachSchema, coachInsightsQuerySchema } from './coach/coach.schema';
import { createDamEntrySchema } from './dam/dam.schema';

const validInput = {
  netSalary: 1500,
  extras: 0,
  holidaySubsidyNet: 0,
  christmasSubsidyNet: 0,
  subsidiesInTwelfths: false,
  holidayMonth: 6,
  christmasMonth: 12,
  includeSubsidies: false,
  includeExtras: false,
  monthlyExpenses: 800,
  savingsMethod: 'percent',
  savingsPercent: 12.5,
  savingsAmount: 0,
};

describe('saveCalculatorInputSchema', () => {
  it('accepts a valid input and strips unknown keys', () => {
    const parsed = saveCalculatorInputSchema.parse({ ...validInput, admin: true });
    expect(parsed).toEqual(validInput);
  });

  it('coerces numeric strings like the old DTOs did', () => {
    expect(saveCalculatorInputSchema.parse({ ...validInput, netSalary: '1500.5' }).netSalary).toBe(
      1500.5,
    );
  });

  it('accepts itemised expenses', () => {
    const expenseItems = [{ name: 'Rent', amount: 500 }];
    expect(saveCalculatorInputSchema.parse({ ...validInput, expenseItems }).expenseItems).toEqual(
      expenseItems,
    );
  });

  it.each([
    ['an expense name that is too long', { expenseItems: [{ name: 'x'.repeat(61), amount: 1 }] }],
    ['a negative expense item', { expenseItems: [{ name: 'Rent', amount: -1 }] }],
    ['more than 2 decimals', { netSalary: 1.234 }],
    ['negative money', { monthlyExpenses: -1 }],
    ['money above the cap', { extras: 1_000_001 }],
    ['percent above 100', { savingsPercent: 101 }],
    ['month out of range', { holidayMonth: 13 }],
    ['non-integer month', { christmasMonth: 6.5 }],
    ['unknown savings method', { savingsMethod: 'magic' }],
    ['string boolean', { includeExtras: 'true' }],
    ['missing field', { netSalary: undefined }],
  ])('rejects %s', (_, override) => {
    expect(saveCalculatorInputSchema.safeParse({ ...validInput, ...override }).success).toBe(false);
  });
});

describe('createDamEntrySchema', () => {
  it('accepts amounts with up to 2 decimals', () => {
    expect(createDamEntrySchema.parse({ amount: 12.34 })).toEqual({ amount: 12.34 });
  });

  it('rejects amounts above the cap or with too many decimals', () => {
    expect(createDamEntrySchema.safeParse({ amount: 1_000_001 }).success).toBe(false);
    expect(createDamEntrySchema.safeParse({ amount: 0.001 }).success).toBe(false);
  });
});

describe('coach schemas', () => {
  it('defaults the locale to pt', () => {
    expect(coachInsightsQuerySchema.parse({})).toEqual({ locale: 'pt' });
    expect(askCoachSchema.parse({ question: 'How much?' })).toEqual({
      question: 'How much?',
      locale: 'pt',
    });
  });

  it('bounds the question length and the locale', () => {
    expect(askCoachSchema.safeParse({ question: 'hi' }).success).toBe(false);
    expect(askCoachSchema.safeParse({ question: 'x'.repeat(501) }).success).toBe(false);
    expect(askCoachSchema.safeParse({ question: 'Hello', locale: 'fr' }).success).toBe(false);
  });
});
