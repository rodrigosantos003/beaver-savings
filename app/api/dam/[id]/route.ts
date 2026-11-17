import * as dam from '@/server/dam/dam.service';
import { route } from '@/server/lib/route';

export const DELETE = route<{ id: string }>({ name: 'dam.remove' }, ({ params, user }) =>
  dam.remove(user.id, params.id),
);
