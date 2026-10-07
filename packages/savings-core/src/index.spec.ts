import { calculateAnnualPlan, calculateTypicalMonth, SavingsInput } from './index';

const baseInput: SavingsInput = {
  baseSalary: 2000,
  holidaySubsidy: 2000,
  christmasSubsidy: 2000,
  holidayMonth: 6,
  christmasMonth: 12,
  subsidiesInTwelfths: false,
  extras: 100,
  includeSubsidies: false,
  includeExtras: false,
  irsRatePercent: 10,
  ssRatePercent: 11,
  monthlyExpenses: 500,
  savingsMethod: 'percent',
  savingsPercent: 15,
  savingsAmount: 0,
};

describe('calculateTypicalMonth', () => {
  it('ignores subsidies and extras when their toggles are off', () => {
    expect(calculateTypicalMonth(baseInput)).toEqual({
      gross: 2000,
      socialSecurity: 220,
      irs: 178,
      net: 1602,
      expenses: 500,
      disposable: 1102,
      savings: 240.3,
      remaining: 861.7,
      savingsExceedsDisposable: false,
    });
  });

  it('spreads subsidies across the typical month and adds extras when included', () => {
    expect(
      calculateTypicalMonth({
        ...baseInput,
        includeSubsidies: true,
        includeExtras: true,
      }),
    ).toEqual({
      gross: 2433.33,
      socialSecurity: 267.67,
      irs: 216.57,
      net: 1949.09,
      expenses: 500,
      disposable: 1449.09,
      savings: 292.36,
      remaining: 1156.73,
      savingsExceedsDisposable: false,
    });
  });

  it('uses a fixed savings amount', () => {
    expect(
      calculateTypicalMonth({
        ...baseInput,
        savingsMethod: 'fixed',
        savingsAmount: 300,
      }),
    ).toMatchObject({
      savings: 300,
      remaining: 802,
      savingsExceedsDisposable: false,
    });
  });

  it('keeps the savings figure and flags it when it exceeds disposable income', () => {
    expect(
      calculateTypicalMonth({
        ...baseInput,
        savingsMethod: 'fixed',
        savingsAmount: 5000,
      }),
    ).toMatchObject({
      savings: 5000,
      disposable: 1102,
      remaining: -3898,
      savingsExceedsDisposable: true,
    });
  });
});

describe('calculateAnnualPlan', () => {
  it('pays holiday and christmas subsidies in June and December', () => {
    const plan = calculateAnnualPlan({
      ...baseInput,
      includeSubsidies: true,
    });

    expect(plan.months).toHaveLength(12);
    expect(plan.months[0]).toMatchObject({
      month: 1,
      gross: 2000,
      savings: 240.3,
      cumulativeSavings: 240.3,
    });
    expect(plan.months[5]).toMatchObject({
      month: 6,
      gross: 4000,
      socialSecurity: 440,
      irs: 356,
      net: 3204,
      savings: 480.6,
      cumulativeSavings: 1682.1,
    });
    expect(plan.months[11]).toMatchObject({
      month: 12,
      gross: 4000,
      savings: 480.6,
    });
    expect(plan.totalSavings).toBe(3364.2);
    expect(plan.months[11].cumulativeSavings).toBe(plan.totalSavings);
  });

  it('pays a twelfth of each subsidy every month', () => {
    const plan = calculateAnnualPlan({
      ...baseInput,
      includeSubsidies: true,
      subsidiesInTwelfths: true,
    });

    expect(plan.months).toHaveLength(12);
    for (const row of plan.months) {
      expect(row).toMatchObject({
        gross: 2333.34,
        socialSecurity: 256.67,
        irs: 207.67,
        net: 1869,
        savings: 280.35,
      });
    }
    expect(plan.months[0].cumulativeSavings).toBe(280.35);
    expect(plan.totalSavings).toBe(3364.2);
  });
});

describe('calculateTypicalMonth with twelfths', () => {
  it('uses one twelfth of each subsidy instead of the yearly average', () => {
    expect(
      calculateTypicalMonth({
        ...baseInput,
        includeSubsidies: true,
        subsidiesInTwelfths: true,
      }),
    ).toMatchObject({
      gross: 2333.34,
      socialSecurity: 256.67,
      irs: 207.67,
      net: 1869,
      savings: 280.35,
    });
  });
});
