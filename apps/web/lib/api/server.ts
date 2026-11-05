import { headers } from 'next/headers';

import 'server-only';

import { HttpError } from './index';

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function serverRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const cookie = (await headers()).get('cookie') ?? '';

  const res = await fetch(`${API_ORIGIN}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init?.body != null ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
      cookie,
    },
  });

  if (!res.ok) throw new HttpError(res.status);
  return res.status === 204 ? (undefined as T) : res.json();
}
