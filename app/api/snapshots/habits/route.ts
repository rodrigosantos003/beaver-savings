import * as calculator from '@/server/calculator/calculator.service';
import { route } from '@/server/lib/route';

export const GET = route({ name: 'snapshots.habits' }, ({ user }) => calculator.getHabits(user.id));
