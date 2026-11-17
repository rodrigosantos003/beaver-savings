import { unauthorized } from '@/server/lib/errors';
import { route } from '@/server/lib/route';
import { isAuthorizedCron } from '@/server/retention/cron-auth';
import { run } from '@/server/retention/retention.service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const GET = route(
  { name: 'maintenance.inactive-accounts', auth: false, rateLimit: false },
  async ({ req }) => {
    if (!isAuthorizedCron(req.headers.get('authorization'))) throw unauthorized();
    return run();
  },
);
