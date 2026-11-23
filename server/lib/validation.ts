import { z } from 'zod';

const hasAtMostTwoDecimals = (n: number) => Math.abs(n * 100 - Math.round(n * 100)) < 1e-9;

/** A finite number with at most 2 decimal places. Numeric strings are coerced. */
export const money = ({ min, max }: { min?: number; max: number }) => {
  let schema = z.coerce.number().finite().max(max);
  if (min !== undefined) schema = schema.min(min);
  return schema.refine(hasAtMostTwoDecimals, 'must have at most 2 decimal places');
};

export const month = () => z.coerce.number().int().min(1).max(12);
