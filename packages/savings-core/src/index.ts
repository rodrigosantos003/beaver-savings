export const DEFAULT_SS_RATE_PERCENT = 11;
export const DEFAULT_HOLIDAY_MONTH = 6;
export const DEFAULT_CHRISTMAS_MONTH = 12;

export type SavingsMethod = 'percent' | 'fixed';

export interface SavingsInput {
  baseSalary: number;
  holidaySubsidy: number;
  christmasSubsidy: number;
  holidayMonth: number;
  christmasMonth: number;
  subsidiesInTwelfths: boolean;
  extras: number;
  includeSubsidies: boolean;
  includeExtras: boolean;
  irsRatePercent: number;
  ssRatePercent: number;
  monthlyExpenses: number;
  savingsMethod: SavingsMethod;
  savingsPercent: number;
  savingsAmount: number;
}

export interface MonthBreakdown {
  gross: number;
  socialSecurity: number;
  irs: number;
  net: number;
  expenses: number;
  disposable: number;
  savings: number;
  remaining: number;
  savingsExceedsDisposable: boolean;
}

export interface AnnualMonth extends MonthBreakdown {
  month: number;
  cumulativeSavings: number;
}

export interface AnnualPlan {
  months: AnnualMonth[];
  totalSavings: number;
}

interface NormalizedInput {
  baseSalary: number;
  holidaySubsidy: number;
  christmasSubsidy: number;
  holidayMonth: number;
  christmasMonth: number;
  subsidiesInTwelfths: boolean;
  extras: number;
  includeSubsidies: boolean;
  includeExtras: boolean;
  irsRatePercent: number;
  ssRatePercent: number;
  monthlyExpenses: number;
  savingsMethod: SavingsMethod;
  savingsPercent: number;
  savingsAmount: number;
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function nonNegative(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

function percentRate(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return Math.min(value, 100);
}

function monthNumber(value: number, fallback: number): number {
  if (!Number.isInteger(value) || value < 1 || value > 12) {
    return fallback;
  }

  return value;
}

function normalize(input: SavingsInput): NormalizedInput {
  return {
    baseSalary: nonNegative(input.baseSalary),
    holidaySubsidy: nonNegative(input.holidaySubsidy),
    christmasSubsidy: nonNegative(input.christmasSubsidy),
    holidayMonth: monthNumber(input.holidayMonth, DEFAULT_HOLIDAY_MONTH),
    christmasMonth: monthNumber(input.christmasMonth, DEFAULT_CHRISTMAS_MONTH),
    subsidiesInTwelfths: input.subsidiesInTwelfths === true,
    extras: nonNegative(input.extras),
    includeSubsidies: input.includeSubsidies,
    includeExtras: input.includeExtras,
    irsRatePercent: percentRate(input.irsRatePercent),
    ssRatePercent: percentRate(input.ssRatePercent),
    monthlyExpenses: nonNegative(input.monthlyExpenses),
    savingsMethod: input.savingsMethod,
    savingsPercent: percentRate(input.savingsPercent),
    savingsAmount: nonNegative(input.savingsAmount),
  };
}

function breakdown(grossInput: number, input: NormalizedInput): MonthBreakdown {
  const gross = roundMoney(grossInput);
  const socialSecurity = roundMoney(gross * (input.ssRatePercent / 100));
  const irs = roundMoney((gross - socialSecurity) * (input.irsRatePercent / 100));
  const net = roundMoney(gross - socialSecurity - irs);
  const expenses = roundMoney(input.monthlyExpenses);
  const disposable = roundMoney(net - expenses);
  const savings =
    input.savingsMethod === 'percent'
      ? roundMoney(net * (input.savingsPercent / 100))
      : roundMoney(input.savingsAmount);
  const remaining = roundMoney(disposable - savings);

  return {
    gross,
    socialSecurity,
    irs,
    net,
    expenses,
    disposable,
    savings,
    remaining,
    savingsExceedsDisposable: savings > disposable,
  };
}

function monthlyGross(input: NormalizedInput, subsidy: number): number {
  const extras = input.includeExtras ? input.extras : 0;
  return input.baseSalary + extras + subsidy;
}

function twelfth(amount: number): number {
  return roundMoney(amount / 12);
}

function twelfthShare(input: NormalizedInput): number {
  return roundMoney(twelfth(input.holidaySubsidy) + twelfth(input.christmasSubsidy));
}

function subsidyInMonth(input: NormalizedInput, month: number): number {
  if (!input.includeSubsidies) {
    return 0;
  }

  if (input.subsidiesInTwelfths) {
    return twelfthShare(input);
  }

  let subsidy = 0;

  if (month === input.holidayMonth) {
    subsidy += input.holidaySubsidy;
  }

  if (month === input.christmasMonth) {
    subsidy += input.christmasSubsidy;
  }

  return subsidy;
}

export function calculateTypicalMonth(input: SavingsInput): MonthBreakdown {
  const normalized = normalize(input);
  const subsidyShare = !normalized.includeSubsidies
    ? 0
    : normalized.subsidiesInTwelfths
      ? twelfthShare(normalized)
      : roundMoney((normalized.holidaySubsidy + normalized.christmasSubsidy) / 12);

  return breakdown(monthlyGross(normalized, subsidyShare), normalized);
}

export function calculateAnnualPlan(input: SavingsInput): AnnualPlan {
  const normalized = normalize(input);
  const months: AnnualMonth[] = [];
  let cumulativeSavings = 0;

  for (let month = 1; month <= 12; month += 1) {
    const row = breakdown(
      monthlyGross(normalized, subsidyInMonth(normalized, month)),
      normalized,
    );
    cumulativeSavings = roundMoney(cumulativeSavings + row.savings);
    months.push({
      ...row,
      month,
      cumulativeSavings,
    });
  }

  return {
    months,
    totalSavings: cumulativeSavings,
  };
}
