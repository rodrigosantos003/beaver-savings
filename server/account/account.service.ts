import { Types } from 'mongoose';
import 'server-only';

import { getDb } from '@/server/db/connection';
import { notFound } from '@/server/lib/errors';

/**
 * Everything Beaver Savings stores about the user, for GDPR access/portability requests.
 * Secrets (password hash, session tokens, OAuth tokens, passkey key material) are deliberately
 * left out.
 */
export async function exportData(userId: string) {
  const db = getDb();

  if (!Types.ObjectId.isValid(userId)) throw notFound();
  const _id = new Types.ObjectId(userId);

  const [user, sessions, accounts, passkeys, plans, damEntries] = await Promise.all([
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
      .find({ userId: _id }, { projection: { _id: 0, providerId: 1, createdAt: 1, updatedAt: 1 } })
      .toArray(),
    db
      .collection('passkeys')
      .find(
        { userId: _id },
        { projection: { _id: 0, name: 1, deviceType: 1, backedUp: 1, createdAt: 1 } },
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

  if (!user) throw notFound();

  return {
    exportedAt: new Date().toISOString(),
    service: 'Beaver Savings',
    profile: user,
    signInMethods: accounts,
    passkeys,
    sessions,
    savingsPlans: plans,
    damDeposits: damEntries,
  };
}
