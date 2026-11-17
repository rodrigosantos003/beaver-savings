import { z } from 'zod';

import { money } from '@/server/lib/validation';

export const createDamEntrySchema = z.object({
  amount: money({ max: 1_000_000 }),
});

export type CreateDamEntry = z.infer<typeof createDamEntrySchema>;
