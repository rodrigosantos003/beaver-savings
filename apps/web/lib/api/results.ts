// lib/results-api.ts
import { AnnualPlan, MonthBreakdown } from 'savings-core';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

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
  createdAt: string; // ISO string over JSON
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include', // send the session cookie
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export function listResults(userId: string) {
  return request<SavedResult[]>(`/results?userId=${encodeURIComponent(userId)}`);
}

export function deleteResult(id: string) {
  return request<void>(`/results/${id}`, { method: 'DELETE' });
}

export function saveResult(userId: string, month: MonthBreakdown, plan: AnnualPlan | null) {
  // Pick fields explicitly so only what the DTO expects is sent
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
      month: String(row.month), // the DTO types this as a string
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
