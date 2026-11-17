import { saveCalculatorInputSchema } from '@/server/calculator/calculator.schema';
import * as calculator from '@/server/calculator/calculator.service';
import { readJson, route } from '@/server/lib/route';

export const POST = route({ name: 'snapshots.save' }, async ({ req, user }) =>
  calculator.save(user.id, await readJson(req, saveCalculatorInputSchema)),
);

export const DELETE = route({ name: 'snapshots.clear' }, ({ user }) => calculator.clear(user.id));
