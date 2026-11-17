import { Types } from 'mongoose';
import 'server-only';

import { badRequest } from './errors';

const OBJECT_ID = /^[a-f\d]{24}$/i;

export const isObjectId = (value: unknown): value is string =>
  typeof value === 'string' && OBJECT_ID.test(value);

/** Better Auth hands ids around as strings; our collections store them as ObjectIds. */
export function toObjectId(value: string, field = 'id'): Types.ObjectId {
  if (!isObjectId(value)) throw badRequest(`Invalid ${field}`);
  return new Types.ObjectId(value);
}
