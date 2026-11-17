import { readRawJson, route } from '@/server/lib/route';
import { parseEmailRequest } from '@/server/savings/parse-email-request';
import * as savingsEmail from '@/server/savings/savings-email.service';

export const POST = route(
  { name: 'savings.email', rateLimit: { limit: 5 }, status: 201 },
  async ({ req }) => savingsEmail.send(parseEmailRequest(await readRawJson(req))),
);
