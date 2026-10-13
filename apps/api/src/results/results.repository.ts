// results/results.repository.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Schema, Types } from 'mongoose';
import type { Model } from 'mongoose';

/** DI token for the Result model (provided in ResultsModule). */
export const RESULT_MODEL = 'RESULT_MODEL';

export interface MonthSummary {
  gross: number;
  socialSecurity: number;
  irs: number;
  net: number;
  expenses: number;
  disposable: number;
  savings: number;
  remaining: number;
}

export interface YearMonth {
  month: string;
  gross: number;
  net: number;
  expenses: number;
  savings: number;
  remaining: number;
  cumulative: number;
}

export interface Result {
  userId: Types.ObjectId;
  month: MonthSummary;
  year: YearMonth[];
  totalSavings: number;
  // Managed by `timestamps`; declared for typing only
  createdAt: Date;
}

export const MonthSummarySchema = new Schema<MonthSummary>(
  {
    gross: { type: Number, required: true },
    socialSecurity: { type: Number, required: true },
    irs: { type: Number, required: true },
    net: { type: Number, required: true },
    expenses: { type: Number, required: true },
    disposable: { type: Number, required: true },
    savings: { type: Number, required: true },
    remaining: { type: Number, required: true },
  },
  { _id: false },
);

export const YearMonthSchema = new Schema<YearMonth>(
  {
    month: { type: String, required: true },
    gross: { type: Number, required: true },
    net: { type: Number, required: true },
    expenses: { type: Number, required: true },
    savings: { type: Number, required: true },
    remaining: { type: Number, required: true },
    cumulative: { type: Number, required: true },
  },
  { _id: false },
);

export const ResultSchema = new Schema<Result>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    month: { type: MonthSummarySchema, required: true },
    year: { type: [YearMonthSchema], required: true },
    totalSavings: { type: Number, required: true },
  },
  {
    collection: 'results',
    timestamps: { createdAt: true, updatedAt: false },
  },
);

ResultSchema.index({ userId: 1 }, { name: 'by_userId' });

/** Plain-object shape, same as the old interface. */
export type ResultDocument = Result & { _id: Types.ObjectId };

@Injectable()
export class ResultsRepository implements OnModuleInit {
  constructor(@Inject(RESULT_MODEL) private readonly model: Model<Result>) { }

  async onModuleInit() {
    await this.model.createIndexes();
  }

  findById(id: string): Promise<ResultDocument | null> {
    return this.model.findById(id).lean<ResultDocument>().exec();
  }

  findByUserId(userId: string): Promise<ResultDocument[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .lean<ResultDocument[]>()
      .exec();
  }

  async deleteById(id: string) {
    const { deletedCount } = await this.model.deleteOne({ _id: id });
    return deletedCount === 1;
  }

  async create(
    data: Omit<ResultDocument, '_id' | 'createdAt'>,
  ): Promise<ResultDocument> {
    const doc = await this.model.create(data);
    return doc.toObject() as ResultDocument;
  }
}