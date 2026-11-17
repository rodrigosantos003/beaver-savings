import { describe, expect, it } from 'vitest';

import { calculateAnnualPlan, calculateTypicalMonth } from './calculate';
import { suggestSavings } from './suggestions';
import type { SavingsInput } from './types';

const base: SavingsInput = {
  netSalary: 1500,
  holidaySubsidyNet: 1200,
  christmasSubsidyNet: 1200,
  holidayMonth: 6,
  christmasMonth: 12,
  subsidiesInTwelfths: false,
  extras: 100,
  includeSubsidies: true,
  includeExtras: false,
  monthlyExpenses: 900,
  savingsMethod: 'percent',
  savingsPercent: 10,
  savingsAmount: 0,
};

describe('calculateTypicalMonth', () => {
  it('spreads lump-sum subsidies across the year', () => {
    const month = calculateTypicalMonth(base);
    expect(month.net).toBe(1700); // 1500 + (1200 + 1200) / 12
    expect(month.disposable).toBe(800);
    expect(month.savings).toBe(170);
    expect(month.remaining).toBe(630);
    expect(month.savingsExceedsDisposable).toBe(false);
  });

  it('does not add subsidies again when they are paid in twelfths', () => {
    expect(calculateTypicalMonth({ ...base, subsidiesInTwelfths: true }).net).toBe(1500);
  });

  it('includes extras only when asked to', () => {
    expect(calculateTypicalMonth({ ...base, includeExtras: true }).net).toBe(1800);
  });

  it('uses the fixed amount and flags savings above what is left', () => {
    const month = calculateTypicalMonth({ ...base, savingsMethod: 'fixed', savingsAmount: 900 });
    expect(month.savings).toBe(900);
    expect(month.savingsExceedsDisposable).toBe(true);
  });

  it('clamps invalid input instead of producing NaN', () => {
    const month = calculateTypicalMonth({
      ...base,
      netSalary: -50,
      monthlyExpenses: Number.NaN,
      savingsPercent: 250,
    });
    expect(month.net).toBe(200); // subsidies only
    expect(month.expenses).toBe(0);
    expect(month.savings).toBe(200); // percent capped at 100
  });
});

describe('calculateAnnualPlan', () => {
  it('pays each subsidy in its month and accumulates savings', () => {
    const plan = calculateAnnualPlan(base);
    expect(plan.months).toHaveLength(12);
    expect(plan.months[0].net).toBe(1500);
    expect(plan.months[5].net).toBe(2700);
    expect(plan.months[11].net).toBe(2700);
    expect(plan.totalSavings).toBe(2040); // 10% of 1500 * 12 + 10% of 2400
    expect(plan.months[11].cumulativeSavings).toBe(plan.totalSavings);
  });

  it('falls back to default months when they are out of range', () => {
    const plan = calculateAnnualPlan({ ...base, holidayMonth: 0, christmasMonth: 13 });
    expect(plan.months[5].net).toBe(2700);
    expect(plan.months[11].net).toBe(2700);
  });
});

describe('suggestSavings', () => {
  it('suggests 20% of what is left after expenses', () => {
    expect(suggestSavings(base)).toEqual({ savingsAmount: 160, savingsPercent: 9.4 });
  });

  it('suggests nothing when there is nothing left', () => {
    expect(suggestSavings({ ...base, monthlyExpenses: 5000 })).toEqual({
      savingsAmount: 0,
      savingsPercent: 0,
    });
  });
});
