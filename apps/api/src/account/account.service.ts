import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { type Connection, Types } from 'mongoose';

import { DATABASE_CONNECTION } from '../../lib/database.js';

@Injectable()
export class AccountService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly connection: Connection) {}

  /**
   * Everything Beaver Savings stores about the user, for GDPR access/portability requests.
   * Secrets (password hash, session tokens, OAuth tokens) are deliberately left out.
   */
  async exportData(userId: string) {
    const db = this.connection.db;
    if (!db) throw new Error('Mongoose connection is not ready');

    if (!Types.ObjectId.isValid(userId)) throw new NotFoundException();
    const _id = new Types.ObjectId(userId);

    const [user, sessions, accounts, plans, damEntries] = await Promise.all([
      db.collection('users').findOne(
        { _id },
        {
          projection: {
            _id: 0,
            name: 1,
            email: 1,
            emailVerified: 1,
            preferredCurrency: 1,
            createdAt: 1,
            updatedAt: 1,
            lastActiveAt: 1,
          },
        },
      ),
      db
        .collection('sessions')
        .find(
          { userId: _id },
          {
            projection: {
              _id: 0,
              createdAt: 1,
              updatedAt: 1,
              expiresAt: 1,
              ipAddress: 1,
              userAgent: 1,
            },
          },
        )
        .sort({ createdAt: -1 })
        .toArray(),
      db
        .collection('accounts')
        .find(
          { userId: _id },
          { projection: { _id: 0, providerId: 1, createdAt: 1, updatedAt: 1 } },
        )
        .toArray(),
      db
        .collection('calculator_snapshots')
        .find({ userId: _id }, { projection: { _id: 0, input: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .toArray(),
      db
        .collection('dam_entries')
        .find({ userId: _id }, { projection: { _id: 0, amount: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .toArray(),
    ]);

    if (!user) throw new NotFoundException();

    return {
      exportedAt: new Date().toISOString(),
      service: 'Beaver Savings',
      profile: user,
      signInMethods: accounts,
      sessions,
      savingsPlans: plans,
      damDeposits: damEntries,
    };
  }
}
