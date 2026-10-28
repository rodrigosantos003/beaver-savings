import type { SavingsInput } from 'savings-core';

import { request } from './index';

export type CalculatorLatest = {
  input: SavingsInput | null;
};

export type CalculatorHabits = {
  samples: number;
  medianSavingsPercent: number | null;
  medianSavingsAmount: number | null;
  medianMonthlyExpenses: number | null;
  preferredMethod: 'percent' | 'fixed' | null;
};

export function saveCalculatorInput(input: SavingsInput) {
  return request<void>('/snapshots', {
    method: 'POST',
    body: JSON.stringify(input),
    keepalive: true,
  });
}

export function getLatestCalculatorInput() {
  return request<CalculatorLatest>('/snapshots/latest');
}

export function getCalculatorHabits() {
  return request<CalculatorHabits>('snapshots/habits');
}

export function clearCalculatorHistory() {
  return request<void>('/snapshots', { method: 'DELETE' });
}
