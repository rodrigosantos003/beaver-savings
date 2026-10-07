// lib/api/dam.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export type DamEntry = {
  id: string;
  amount: number;
  label?: string;
  createdAt: string; // ISO string over JSON
};

export type DamState = {
  entries: DamEntry[];
  total: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include', // send the session cookie
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export function listDam(userId: string) {
  return request<DamState>(`/dam?userId=${encodeURIComponent(userId)}`);
}

export function addDamEntry(userId: string, amount: number, label?: string) {
  // Pick fields explicitly so only what the DTO expects is sent
  const body = { amount, ...(label ? { label } : {}) };
  return request<DamEntry>(`/dam?userId=${encodeURIComponent(userId)}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function removeDamEntry(userId: string, id: string) {
  return request<void>(`/dam/${encodeURIComponent(id)}?userId=${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  });
}
