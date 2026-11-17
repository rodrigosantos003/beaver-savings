import 'server-only';

import { notFound } from '@/server/lib/errors';
import { toObjectId } from '@/server/lib/object-id';

import * as repo from './dam.repository';
import type { DamEntryDocument } from './dam.repository';
import type { CreateDamEntry } from './dam.schema';

export type DamEntryResponse = {
  id: string;
  amount: number;
  createdAt: string;
};

export type DamResponse = {
  entries: DamEntryResponse[];
  total: number;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function toResponse(doc: DamEntryDocument): DamEntryResponse {
  return {
    id: doc._id.toString(),
    amount: doc.amount,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function list(userId: string): Promise<DamResponse> {
  const docs = await repo.findByUserId(toObjectId(userId, 'userId'));
  return {
    entries: docs.map(toResponse),
    total: round2(docs.reduce((sum, d) => sum + d.amount, 0)),
  };
}

export async function create(userId: string, input: CreateDamEntry): Promise<DamEntryResponse> {
  const doc = await repo.create({
    userId: toObjectId(userId, 'userId'),
    amount: round2(input.amount),
  });
  return toResponse(doc);
}

export async function remove(userId: string, id: string): Promise<void> {
  const deleted = await repo.deleteByIdAndUserId(
    toObjectId(id, 'id'),
    toObjectId(userId, 'userId'),
  );
  if (!deleted) throw notFound('Dam entry not found');
}
