import { Schema, Types } from 'mongoose';
import 'server-only';

import { getModel } from '@/server/db/connection';

export interface DamEntry {
  userId: Types.ObjectId;
  amount: number;
  createdAt: Date;
}

const DamEntrySchema = new Schema<DamEntry>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
  },
  {
    collection: 'dam_entries',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

DamEntrySchema.index({ userId: 1, createdAt: -1 }, { name: 'by_userId_createdAt' });

export type DamEntryDocument = DamEntry & { _id: Types.ObjectId };

const model = () => getModel('DamEntry', DamEntrySchema);

export function findByUserId(userId: Types.ObjectId): Promise<DamEntryDocument[]> {
  return model().find({ userId }).sort({ createdAt: -1 }).lean<DamEntryDocument[]>().exec();
}

export async function create(
  data: Omit<DamEntryDocument, '_id' | 'createdAt'>,
): Promise<DamEntryDocument> {
  const doc = await model().create(data);
  return doc.toObject();
}

/** Scoped by userId so users can only delete their own entries. */
export async function deleteByIdAndUserId(id: Types.ObjectId, userId: Types.ObjectId) {
  const { deletedCount } = await model().deleteOne({ _id: id, userId });
  return deletedCount === 1;
}
