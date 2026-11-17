import { coachInsightsQuerySchema } from '@/server/coach/coach.schema';
import * as coach from '@/server/coach/coach.service';
import { readQuery, route } from '@/server/lib/route';

// The AI provider call alone may take up to 25s.
export const maxDuration = 30;

export const GET = route(
  { name: 'coach.insights', rateLimit: coach.COACH_RATE_LIMIT },
  ({ req, user }) => coach.insights(user, readQuery(req, coachInsightsQuerySchema).locale),
);
