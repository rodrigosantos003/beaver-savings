import { health } from '@/server/health/health.service';
import { route } from '@/server/lib/route';

export const dynamic = 'force-dynamic';

export const GET = route({ name: 'health', auth: false, rateLimit: false }, async () => {
  const result = await health();
  return Response.json(result, { status: result.status === 'ok' ? 200 : 503 });
});
