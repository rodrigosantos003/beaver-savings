export type SavingsMethod = 'percent' | 'fixed';

/**
 * Todos os valores de rendimento são LÍQUIDOS (o que cai na conta).
 * - netSalary: líquido mensal. Se subsidiesInTwelfths for true, já inclui os subsídios.
 * - holidaySubsidyNet / christmasSubsidyNet: líquido recebido no mês do subsídio
 *   (só usados quando subsidiesInTwelfths é false).
 */
export interface ExpenseItem {
  name: string;
  amount: number;
}

export interface SavingsInput {
  netSalary: number;
  holidaySubsidyNet: number;
  christmasSubsidyNet: number;
  holidayMonth: number;
  christmasMonth: number;
  subsidiesInTwelfths: boolean;
  extras: number;
  includeSubsidies: boolean;
  includeExtras: boolean;
  monthlyExpenses: number;
  /** When present, monthlyExpenses is the sum of these amounts. */
  expenseItems?: ExpenseItem[];
  savingsMethod: SavingsMethod;
  savingsPercent: number;
  savingsAmount: number;
}

export interface MonthBreakdown {
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
