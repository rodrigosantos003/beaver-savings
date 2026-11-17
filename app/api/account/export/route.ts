import { exportData } from '@/server/account/account.service';
import { route } from '@/server/lib/route';

export const GET = route({ name: 'account.export', rateLimit: { limit: 5 } }, ({ user }) =>
  exportData(user.id),
);
