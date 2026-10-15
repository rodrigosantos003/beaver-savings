import { request, withQuery } from './index';

export type DamEntry = {
  id: string;
  amount: number;
  createdAt: string;
};

export type DamState = {
  entries: DamEntry[];
  total: number;
};

export function listDam(userId: string) {
  return request<DamState>(withQuery('/dam', { userId }));
}

export function addDamEntry(userId: string, amount: number) {
  return request<DamEntry>(withQuery('/dam', { userId }), {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export function removeDamEntry(userId: string, id: string) {
  return request<void>(withQuery(`/dam/${encodeURIComponent(id)}`, { userId }), {
    method: 'DELETE',
  });
}