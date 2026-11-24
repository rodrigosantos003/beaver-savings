import { describe, expect, it } from 'vitest';

import { MAX_EXPENSE_ITEMS, sanitizeExpenseItems, sumExpenses } from './expenses';

describe('sumExpenses', () => {
  it('adds amounts without floating point drift', () => {
    expect(
      sumExpenses([
        { name: 'a', amount: 0.1 },
        { name: 'b', amount: 0.2 },
      ]),
    ).toBe(0.3);
  });

  it('returns 0 for an empty list', () => {
    expect(sumExpenses([])).toBe(0);
  });
});

describe('sanitizeExpenseItems', () => {
  it('drops malformed items', () => {
    expect(
      sanitizeExpenseItems([
        { name: 'Rent', amount: 500 },
        { name: 'Bad', amount: '10' },
        { name: 'Negative', amount: -1 },
        null,
        { amount: 5 },
      ]),
    ).toEqual([{ name: 'Rent', amount: 500 }]);
  });

  it('returns undefined for non-arrays and empty results', () => {
    expect(sanitizeExpenseItems(undefined)).toBeUndefined();
    expect(sanitizeExpenseItems('x')).toBeUndefined();
    expect(sanitizeExpenseItems([])).toBeUndefined();
  });

  it('caps the number of items', () => {
    const many = Array.from({ length: MAX_EXPENSE_ITEMS + 5 }, () => ({ name: 'x', amount: 1 }));
    expect(sanitizeExpenseItems(many)).toHaveLength(MAX_EXPENSE_ITEMS);
  });
});
