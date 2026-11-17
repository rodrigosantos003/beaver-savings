import { askCoachSchema } from '@/server/coach/coach.schema';
import * as coach from '@/server/coach/coach.service';
import { readJson, route } from '@/server/lib/route';

// The AI provider call alone may take up to 25s.
export const maxDuration = 30;

export const POST = route(
  { name: 'coach.ask', rateLimit: coach.COACH_RATE_LIMIT },
  async ({ req, user }) => {
    const { question, locale } = await readJson(req, askCoachSchema);
    return coach.ask(user, question, locale);
  },
);
