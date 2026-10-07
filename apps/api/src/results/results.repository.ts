import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Collection, Db, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import { MONGO_DB } from '../../lib/database';

export interface ResultDocument {
  _id: ObjectId;
  userId: ObjectId;
  month: {
    gross: number;
    socialSecurity: number;
    irs: number;
    net: number;
    expenses: number;
    disposable: number;
    savings: number;
    remaining: number;
  };
  year: {
    month: string;
    gross: number;
    net: number;
    expenses: number;
    savings: number;
    remaining: number;
    cumulative: number;
  }[];
  totalSavings: number;
  createdAt: Date;
}

@Injectable()
export class ResultsRepository implements OnModuleInit {
  readonly collection: Collection<ResultDocument>;

  constructor(@Inject(MONGO_DB) db: Db) {
    this.collection = db.collection<ResultDocument>('results');
  }

  async onModuleInit() {
    await this.collection.createIndexes([
      { key: { userId: 1 }, name: 'by_userId' },
    ]);
  }

  findById(id: string) {
    return this.collection.findOne({ _id: new ObjectId(id) });
  }

  findByUserId(userId: string) {
    return this.collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async deleteById(id: string) {
    const { deletedCount } = await this.collection.deleteOne({
      _id: new ObjectId(id),
    });
    return deletedCount === 1;
  }

  async create(data: Omit<ResultDocument, '_id' | 'createdAt'>) {
    const doc = {
      ...data,
      createdAt: new Date(),
    } as OptionalUnlessRequiredId<ResultDocument>;
    const { insertedId } = await this.collection.insertOne(doc);
    return { ...doc, _id: insertedId } as ResultDocument;
  }
}
