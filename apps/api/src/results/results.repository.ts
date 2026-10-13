// results/results.repository.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import type { Model } from 'mongoose';

@Schema({ _id: false })
export class MonthSummary {
  @Prop({ required: true }) gross: number;
  @Prop({ required: true }) socialSecurity: number;
  @Prop({ required: true }) irs: number;
  @Prop({ required: true }) net: number;
  @Prop({ required: true }) expenses: number;
  @Prop({ required: true }) disposable: number;
  @Prop({ required: true }) savings: number;
  @Prop({ required: true }) remaining: number;
}
export const MonthSummarySchema = SchemaFactory.createForClass(MonthSummary);

@Schema({ _id: false })
export class YearMonth {
  @Prop({ required: true }) month: string;
  @Prop({ required: true }) gross: number;
  @Prop({ required: true }) net: number;
  @Prop({ required: true }) expenses: number;
  @Prop({ required: true }) savings: number;
  @Prop({ required: true }) remaining: number;
  @Prop({ required: true }) cumulative: number;
}
export const YearMonthSchema = SchemaFactory.createForClass(YearMonth);

@Schema({
  collection: 'results',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Result {
  @Prop({ type: Types.ObjectId, required: true, index: { name: 'by_userId' } })
  userId: Types.ObjectId;

  @Prop({ type: MonthSummarySchema, required: true })
  month: MonthSummary;

  @Prop({ type: [YearMonthSchema], required: true })
  year: YearMonth[];

  @Prop({ required: true })
  totalSavings: number;

  // Managed by `timestamps`; declared for typing only
  createdAt: Date;
}
export const ResultSchema = SchemaFactory.createForClass(Result);

/** Plain-object shape, same as the old interface. */
export type ResultDocument = Result & { _id: Types.ObjectId };

@Injectable()
export class ResultsRepository implements OnModuleInit {
  constructor(
    @InjectModel(Result.name) private readonly model: Model<Result>,
  ) {}

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
