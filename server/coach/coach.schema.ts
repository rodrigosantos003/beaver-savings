import { z } from 'zod';

export const COACH_LOCALES = ['pt', 'en'] as const;
export type CoachLocale = (typeof COACH_LOCALES)[number];

const locale = z.enum(COACH_LOCALES).default('pt');

export const coachInsightsQuerySchema = z.object({ locale });

export const askCoachSchema = z.object({
  question: z.string().min(3).max(500),
  locale,
});
