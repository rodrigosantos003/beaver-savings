import type { ExpenseItem } from './types';

export const MAX_EXPENSE_ITEMS = 50;
export const MAX_EXPENSE_NAME_LENGTH = 60;

export function sumExpenses(items: ExpenseItem[]): number {
  const cents = items.reduce((total, item) => total + Math.round(item.amount * 100), 0);
  return cents / 100;
}

/** Keeps only well-formed items from untrusted data (e.g. an old saved plan). */
export function sanitizeExpenseItems(value: unknown): ExpenseItem[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const items = value
    .filter(
      (item): item is ExpenseItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.amount === 'number' &&
        Number.isFinite(item.amount) &&
        item.amount >= 0,
    )
    .slice(0, MAX_EXPENSE_ITEMS)
    .map((item) => ({ name: item.name.slice(0, MAX_EXPENSE_NAME_LENGTH), amount: item.amount }));

  return items.length > 0 ? items : undefined;
}
