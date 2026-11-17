import { Schema, Types } from 'mongoose';
import 'server-only';

import { getModel } from '@/server/db/connection';
import type { SavingsInput } from '@/shared/savings/types';

export interface CalculatorSnapshot {
  userId: Types.ObjectId;
  input: SavingsInput;
  schemaVersion: number;
  createdAt: Date;
}

const CalculatorSnapshotSchema = new Schema<CalculatorSnapshot>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    input: { type: Schema.Types.Mixed, required: true },
    schemaVersion: { type: Number, required: true },
  },
  {
    collection: 'calculator_snapshots',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

CalculatorSnapshotSchema.index({ userId: 1, createdAt: -1 }, { name: 'by_userId_createdAt' });

export type CalculatorSnapshotDocument = CalculatorSnapshot & { _id: Types.ObjectId };

const model = () => getModel('CalculatorSnapshot', CalculatorSnapshotSchema);

export function findRecentByUserId(
  userId: Types.ObjectId,
  limit: number,
): Promise<CalculatorSnapshotDocument[]> {
  return model()
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean<CalculatorSnapshotDocument[]>()
    .exec();
}

export async function create(data: Omit<CalculatorSnapshotDocument, '_id' | 'createdAt'>) {
  await model().create(data);
}

export async function pruneKeepingLatest(userId: Types.ObjectId, keep: number) {
  const stale = await model()
    .find({ userId }, { _id: 1 })
    .sort({ createdAt: -1 })
    .skip(keep)
    .lean()
    .exec();

  if (stale.length) {
    await model().deleteMany({ _id: { $in: stale.map((d) => d._id) } });
  }
}

export async function deleteAllByUserId(userId: Types.ObjectId) {
  await model().deleteMany({ userId });
}
