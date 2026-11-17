import type { AnnualMonth, AnnualPlan, MonthBreakdown, SavingsInput } from './types';

export const DEFAULT_HOLIDAY_MONTH = 6;
export const DEFAULT_CHRISTMAS_MONTH = 12;

type NormalizedInput = SavingsInput;

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
    netSalary: nonNegative(input.netSalary),
    holidaySubsidyNet: nonNegative(input.holidaySubsidyNet),
    christmasSubsidyNet: nonNegative(input.christmasSubsidyNet),
    holidayMonth: monthNumber(input.holidayMonth, DEFAULT_HOLIDAY_MONTH),
    christmasMonth: monthNumber(input.christmasMonth, DEFAULT_CHRISTMAS_MONTH),
    subsidiesInTwelfths: input.subsidiesInTwelfths === true,
    extras: nonNegative(input.extras),
    includeSubsidies: input.includeSubsidies,
    includeExtras: input.includeExtras,
    monthlyExpenses: nonNegative(input.monthlyExpenses),
    savingsMethod: input.savingsMethod,
    savingsPercent: percentRate(input.savingsPercent),
    savingsAmount: nonNegative(input.savingsAmount),
  };
}

function breakdown(netInput: number, input: NormalizedInput): MonthBreakdown {
  const net = roundMoney(netInput);
  const expenses = roundMoney(input.monthlyExpenses);
  const disposable = roundMoney(net - expenses);
  const savings =
    input.savingsMethod === 'percent'
      ? roundMoney(net * (input.savingsPercent / 100))
      : roundMoney(input.savingsAmount);
  const remaining = roundMoney(disposable - savings);

  return {
    net,
    expenses,
    disposable,
    savings,
    remaining,
    savingsExceedsDisposable: savings > disposable,
  };
}

function monthlyNet(input: NormalizedInput, subsidy: number): number {
  const extras = input.includeExtras ? input.extras : 0;
  return input.netSalary + extras + subsidy;
}

/**
 * Líquido do subsídio recebido num mês concreto.
 * Com duodécimos, os subsídios já estão no líquido mensal, por isso não se somam.
 */
function subsidyInMonth(input: NormalizedInput, month: number): number {
  if (!input.includeSubsidies || input.subsidiesInTwelfths) {
    return 0;
  }

  let subsidy = 0;

  if (month === input.holidayMonth) {
    subsidy += input.holidaySubsidyNet;
  }

  if (month === input.christmasMonth) {
    subsidy += input.christmasSubsidyNet;
  }

  return subsidy;
}

/** Média mensal dos subsídios líquidos (só quando não são pagos em duodécimos). */
function averageSubsidy(input: NormalizedInput): number {
  if (!input.includeSubsidies || input.subsidiesInTwelfths) {
    return 0;
  }

  return roundMoney((input.holidaySubsidyNet + input.christmasSubsidyNet) / 12);
}

export function calculateTypicalMonth(input: SavingsInput): MonthBreakdown {
  const normalized = normalize(input);

  return breakdown(monthlyNet(normalized, averageSubsidy(normalized)), normalized);
}

export function calculateAnnualPlan(input: SavingsInput): AnnualPlan {
  const normalized = normalize(input);
  const months: AnnualMonth[] = [];
  let cumulativeSavings = 0;

  for (let month = 1; month <= 12; month += 1) {
    const row = breakdown(monthlyNet(normalized, subsidyInMonth(normalized, month)), normalized);
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
