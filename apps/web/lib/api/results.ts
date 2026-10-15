import { AnnualPlan, MonthBreakdown } from 'savings-core';
import { request, withQuery } from './index';

export type SavedResult = {
  _id: string;
  userId: string;
  month: Omit<MonthBreakdown, 'savingsExceedsDisposable'>;
  year: {
    month: string;
    gross: number;
    net: number;
    expenses: number;
    savings: number;
    remaining: number;
    cumulative: number;
  }[];
  totalSavings: number;
  createdAt: string;
};

export function listResults(userId: string) {
  return request<SavedResult[]>(withQuery('/results', { userId }));
}

export function deleteResult(id: string) {
  return request<void>(`/results/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function saveResult(userId: string, month: MonthBreakdown, plan: AnnualPlan | null) {
  const body = {
    userId,
    month: {
      gross: month.gross,
      socialSecurity: month.socialSecurity,
      irs: month.irs,
      net: month.net,
      expenses: month.expenses,
      disposable: month.disposable,
      savings: month.savings,
      remaining: month.remaining,
    },
    year: (plan?.months ?? []).map((row) => ({
      month: String(row.month),
      gross: row.gross,
      net: row.net,
      expenses: row.expenses,
      savings: row.savings,
      remaining: row.remaining,
      cumulative: row.cumulativeSavings,
    })),
    totalSavings: plan?.totalSavings ?? 0,
  };
  return request<SavedResult>('/results', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}