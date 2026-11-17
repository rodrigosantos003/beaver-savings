import { Inject, Injectable, Logger } from '@nestjs/common';

import type { Connection, Types } from 'mongoose';

import { DATABASE_CONNECTION } from '../../lib/database.js';
import { sendEmail } from '../../lib/email.js';
import { buildInactivityWarningEmail } from './inactivity.email.js';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Accounts with no activity for this long are deleted (stated in the Privacy Policy). */
export const INACTIVE_AFTER_DAYS = 730; // 24 months
/** Verified users are warned by email this long before deletion. */
export const WARNING_NOTICE_DAYS = 30;

/** Kept small so one run fits comfortably in a serverless invocation and email rate limits. */
const MAX_WARNINGS_PER_RUN = 20;
const MAX_DELETIONS_PER_RUN = 100;

/** Collections holding data linked to a user by `userId` (ObjectId). */
const USER_DATA_COLLECTIONS = ['sessions', 'accounts', 'dam_entries', 'calculator_snapshots'];

type CandidateUser = {
  _id: Types.ObjectId;
  email: string;
  name?: string;
  emailVerified?: boolean;
  lastSeenAt: Date;
  inactivityWarningSentAt?: Date;
};

export type RetentionRunResult = {
  warned: number;
  warningFailures: number;
  deleted: number;
};

@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(@Inject(DATABASE_CONNECTION) private readonly connection: Connection) {}

  private get db() {
    const db = this.connection.db;
    if (!db) throw new Error('Mongoose connection is not ready');
    return db;
  }

  async run(now = new Date()): Promise<RetentionRunResult> {
    const { warned, warningFailures } = await this.sendWarnings(now);
    const deleted = await this.deleteInactive(now);

    this.logger.log(`Retention run: warned=${warned} failed=${warningFailures} deleted=${deleted}`);
    return { warned, warningFailures, deleted };
  }

  /**
   * Last activity = latest of: account creation, last sign-in / session refresh recorded on the
   * user (`lastActiveAt`), and the newest session still in the database.
   */
  private findInactiveSince(cutoff: Date, extraMatch: object, limit: number) {
    return this.db
      .collection('users')
      .aggregate<CandidateUser>([
        {
          $lookup: {
            from: 'sessions',
            localField: '_id',
            foreignField: 'userId',
            pipeline: [{ $group: { _id: null, last: { $max: '$updatedAt' } } }],
            as: 'sessionActivity',
          },
        },
        {
          $addFields: {
            lastSeenAt: {
              $max: ['$createdAt', '$lastActiveAt', { $first: '$sessionActivity.last' }],
            },
          },
        },
        { $match: { lastSeenAt: { $lt: cutoff }, ...extraMatch } },
        {
          $project: {
            email: 1,
            name: 1,
            emailVerified: 1,
            lastSeenAt: 1,
            inactivityWarningSentAt: 1,
          },
        },
        { $limit: limit },
      ])
      .toArray();
  }

  private async sendWarnings(now: Date) {
    const warnCutoff = new Date(
      now.getTime() - (INACTIVE_AFTER_DAYS - WARNING_NOTICE_DAYS) * DAY_MS,
    );

    const candidates = await this.findInactiveSince(
      warnCutoff,
      {
        emailVerified: true,
        // Not warned yet, or warned before their most recent activity (they came back, then left).
        $expr: {
          $or: [
            { $eq: [{ $ifNull: ['$inactivityWarningSentAt', null] }, null] },
            { $lt: ['$inactivityWarningSentAt', '$lastSeenAt'] },
          ],
        },
      },
      MAX_WARNINGS_PER_RUN,
    );

    let warned = 0;
    let warningFailures = 0;

    for (const user of candidates) {
      const deleteAfter = new Date(
        Math.max(
          user.lastSeenAt.getTime() + INACTIVE_AFTER_DAYS * DAY_MS,
          now.getTime() + WARNING_NOTICE_DAYS * DAY_MS,
        ),
      );

      try {
        const { subject, text, html } = buildInactivityWarningEmail({
          email: user.email,
          name: user.name,
          deleteAfter,
        });
        await sendEmail({ to: user.email, subject, text, html });
        await this.db
          .collection('users')
          .updateOne({ _id: user._id }, { $set: { inactivityWarningSentAt: now } });
        warned++;
      } catch (error) {
        warningFailures++;
        this.logger.error(
          `Inactivity warning failed for user ${String(user._id)}`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    return { warned, warningFailures };
  }

  private async deleteInactive(now: Date) {
    const deleteCutoff = new Date(now.getTime() - INACTIVE_AFTER_DAYS * DAY_MS);
    const noticeCutoff = new Date(now.getTime() - WARNING_NOTICE_DAYS * DAY_MS);

    const candidates = await this.findInactiveSince(
      deleteCutoff,
      {
        $or: [
          // Unverified addresses are never emailed, so they are removed without a warning.
          { emailVerified: { $ne: true } },
          // Verified users: only once a warning sent after their last activity is 30+ days old.
          {
            inactivityWarningSentAt: { $lte: noticeCutoff },
            $expr: { $gte: ['$inactivityWarningSentAt', '$lastSeenAt'] },
          },
        ],
      },
      MAX_DELETIONS_PER_RUN,
    );

    if (candidates.length === 0) return 0;

    const ids = candidates.map((user) => user._id);
    await Promise.all(
      USER_DATA_COLLECTIONS.map((name) =>
        this.db.collection(name).deleteMany({ userId: { $in: ids } }),
      ),
    );
    const { deletedCount } = await this.db.collection('users').deleteMany({ _id: { $in: ids } });

    return deletedCount;
  }
}
