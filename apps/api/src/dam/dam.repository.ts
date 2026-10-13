// dam/dam.repository.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Model } from 'mongoose';

@Schema({
  collection: 'dam_entries',
  timestamps: { createdAt: true, updatedAt: false },
})
export class DamEntry {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  /** Amount applied to the dam, in euros (2 decimals). */
  @Prop({ required: true })
  amount: number;

  /** Optional note, e.g. the month name or "Monthly savings". */
  @Prop()
  label?: string;

  // Managed by `timestamps`; declared for typing only
  createdAt: Date;
}
export const DamEntrySchema = SchemaFactory.createForClass(DamEntry);

DamEntrySchema.index(
  { userId: 1, createdAt: -1 },
  { name: 'by_userId_createdAt' },
);

/** Plain-object shape, same as the old interface. */
export type DamEntryDocument = DamEntry & { _id: Types.ObjectId };

@Injectable()
export class DamRepository implements OnModuleInit {
  constructor(
    @InjectModel(DamEntry.name) private readonly model: Model<DamEntry>,
  ) {}

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
