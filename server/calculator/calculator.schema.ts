import { z } from 'zod';

import { money, month } from '@/server/lib/validation';
import { MAX_EXPENSE_ITEMS, MAX_EXPENSE_NAME_LENGTH } from '@/shared/savings/expenses';
import type { SavingsInput } from '@/shared/savings/types';

const amount = () => money({ min: 0, max: 1_000_000 });

export const saveCalculatorInputSchema = z.object({
  netSalary: amount(),
  extras: amount(),
  holidaySubsidyNet: amount(),
  christmasSubsidyNet: amount(),
  subsidiesInTwelfths: z.boolean(),
  holidayMonth: month(),
  christmasMonth: month(),
  includeSubsidies: z.boolean(),
  includeExtras: z.boolean(),
  monthlyExpenses: amount(),
  expenseItems: z
    .array(z.object({ name: z.string().trim().max(MAX_EXPENSE_NAME_LENGTH), amount: amount() }))
    .max(MAX_EXPENSE_ITEMS)
    .optional(),
  savingsMethod: z.enum(['percent', 'fixed']),
  savingsPercent: money({ min: 0, max: 100 }),
  savingsAmount: amount(),
}) satisfies z.ZodType<SavingsInput>;
