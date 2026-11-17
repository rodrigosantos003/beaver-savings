import { Inject, Injectable, OnModuleInit } from '@nestjs/common';

import { Schema, Types } from 'mongoose';
import type { Model } from 'mongoose';
import type { SavingsInput } from 'savings-core';

export const CALCULATOR_SNAPSHOT_MODEL = 'CALCULATOR_SNAPSHOT_MODEL';

export interface CalculatorSnapshot {
  userId: Types.ObjectId;
  input: SavingsInput;
  schemaVersion: number;
  createdAt: Date;
}

export const CalculatorSnapshotSchema = new Schema<CalculatorSnapshot>(
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

@Injectable()
export class CalculatorRepository implements OnModuleInit {
  constructor(
    @Inject(CALCULATOR_SNAPSHOT_MODEL) private readonly model: Model<CalculatorSnapshot>,
  ) {}

  async onModuleInit() {
    await this.model.createIndexes();
  }

  findRecentByUserId(userId: Types.ObjectId, limit: number): Promise<CalculatorSnapshotDocument[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<CalculatorSnapshotDocument[]>()
      .exec();
  }

  async create(data: Omit<CalculatorSnapshotDocument, '_id' | 'createdAt'>) {
    await this.model.create(data);
  }

  async pruneKeepingLatest(userId: Types.ObjectId, keep: number) {
    const stale = await this.model
      .find({ userId }, { _id: 1 })
      .sort({ createdAt: -1 })
      .skip(keep)
      .lean()
      .exec();

    if (stale.length) {
      await this.model.deleteMany({ _id: { $in: stale.map((d) => d._id) } });
    }
  }

  async deleteAllByUserId(userId: Types.ObjectId) {
    await this.model.deleteMany({ userId });
  }
}
