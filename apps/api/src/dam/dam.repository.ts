import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Collection, Db, ObjectId, OptionalUnlessRequiredId } from 'mongodb';
import { MONGO_DB } from '../../lib/database';

export interface DamEntryDocument {
    _id: ObjectId;
    userId: ObjectId;
    /** Amount applied to the dam, in euros (2 decimals). */
    amount: number;
    /** Optional note, e.g. the month name or "Monthly savings". */
    label?: string;
    createdAt: Date;
}

@Injectable()
export class DamRepository implements OnModuleInit {
    readonly collection: Collection<DamEntryDocument>;

    constructor(@Inject(MONGO_DB) db: Db) {
        this.collection = db.collection<DamEntryDocument>('dam_entries');
    }

    async onModuleInit() {
        await this.collection.createIndexes([
            { key: { userId: 1, createdAt: -1 }, name: 'by_userId_createdAt' },
        ]);
    }

    findByUserId(userId: ObjectId) {
        return this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    }

    async create(data: Omit<DamEntryDocument, '_id' | 'createdAt'>) {
        const doc = {
            ...data,
            createdAt: new Date(),
        } as OptionalUnlessRequiredId<DamEntryDocument>;
        const { insertedId } = await this.collection.insertOne(doc);
        return { ...doc, _id: insertedId } as DamEntryDocument;
    }

    /** Scoped by userId so users can only delete their own entries. */
    async deleteByIdAndUserId(id: ObjectId, userId: ObjectId) {
        const { deletedCount } = await this.collection.deleteOne({
            _id: id,
            userId,
        });
        return deletedCount === 1;
    }
}