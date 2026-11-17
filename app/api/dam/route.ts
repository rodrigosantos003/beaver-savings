import { createDamEntrySchema } from '@/server/dam/dam.schema';
import * as dam from '@/server/dam/dam.service';
import { readJson, route } from '@/server/lib/route';

export const GET = route({ name: 'dam.list' }, ({ user }) => dam.list(user.id));

export const POST = route({ name: 'dam.create', status: 201 }, async ({ req, user }) =>
  dam.create(user.id, await readJson(req, createDamEntrySchema)),
);
