// dam/dam.repository.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Schema, Types } from 'mongoose';
import type { Model } from 'mongoose';

/** DI token for the DamEntry model (provided in DamModule). */
export const DAM_ENTRY_MODEL = 'DAM_ENTRY_MODEL';

export interface DamEntry {
  userId: Types.ObjectId;
  /** Amount applied to the dam, in euros (2 decimals). */
  amount: number;
  /** Optional note, e.g. the month name or "Monthly savings". */
  label?: string;
  // Managed by `timestamps`; declared for typing only
  createdAt: Date;
}

export const DamEntrySchema = new Schema<DamEntry>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    amount: { type: Number, required: true },
    label: { type: String },
  },
  {
    collection: 'dam_entries',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

DamEntrySchema.index(
  { userId: 1, createdAt: -1 },
  { name: 'by_userId_createdAt' },
);

/** Plain-object shape, same as the old interface. */
export type DamEntryDocument = DamEntry & { _id: Types.ObjectId };

@Injectable()
export class DamRepository implements OnModuleInit {
  constructor(
    @Inject(DAM_ENTRY_MODEL) private readonly model: Model<DamEntry>,
  ) { }

  async onModuleInit() {
    await this.model.createIndexes();
  }

  findByUserId(userId: Types.ObjectId): Promise<DamEntryDocument[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean<DamEntryDocument[]>()
      .exec();
  }

  async create(
    data: Omit<DamEntryDocument, '_id' | 'createdAt'>,
  ): Promise<DamEntryDocument> {
    const doc = await this.model.create(data);
    return doc.toObject() as DamEntryDocument;
  }

  /** Scoped by userId so users can only delete their own entries. */
  async deleteByIdAndUserId(id: Types.ObjectId, userId: Types.ObjectId) {
    const { deletedCount } = await this.model.deleteOne({ _id: id, userId });
    return deletedCount === 1;
  }
}