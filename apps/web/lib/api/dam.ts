import { request } from './index';

export type DamEntry = {
  id: string;
  amount: number;
  createdAt: string;
};

export type DamState = {
  entries: DamEntry[];
  total: number;
};

export function listDam() {
  return request<DamState>('/dam');
}

export function addDamEntry(amount: number) {
  return request<DamEntry>('/dam', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export function removeDamEntry(id: string) {
  return request<void>(`/dam/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
