'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { type DamEntry, addDamEntry, listDam, removeDamEntry } from '../api/dam';

export type { DamEntry };
export type DamError = 'load' | 'add' | 'withdraw' | 'remove' | null;

const round2 = (n: number) => Math.round(n * 100) / 100;

export function useDam(userId?: string | null) {
  const [loaded, setLoaded] = useState<DamEntry[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<DamError>(null);

  const [prevUserId, setPrevUserId] = useState(userId);
  if (prevUserId !== userId) {
    setPrevUserId(userId);
    setError(null);
  }

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    listDam()
      .then((res) => {
        if (cancelled) return;
        setLoaded(res.entries);
        setLoadedFor(userId);
      })
      .catch(() => {
        if (cancelled) return;
        setError('load');
        setLoadedFor(userId);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const entries = useMemo(
    () => (userId && loadedFor === userId ? loaded : []),
    [userId, loadedFor, loaded],
  );
  const loading = !!userId && loadedFor !== userId;

  const total = useMemo(() => round2(entries.reduce((sum, e) => sum + e.amount, 0)), [entries]);

  const post = useCallback(
    async (amount: number, errorKind: 'add' | 'withdraw'): Promise<boolean> => {
      if (!userId || !Number.isFinite(amount) || amount === 0) return false;
      setAdding(true);
      setError(null);
      try {
        const created = await addDamEntry(round2(amount));
        setLoaded((prev) => [created, ...prev]);
        return true;
      } catch {
        setError(errorKind);
        return false;
      } finally {
        setAdding(false);
      }
    },
    [userId],
  );

  const add = useCallback(
    (amount: number): Promise<boolean> =>
      amount > 0 ? post(amount, 'add') : Promise.resolve(false),
    [post],
  );

  const withdraw = useCallback(
    (amount: number): Promise<boolean> => {
      // Never take out more than is currently in the dam.
      const capped = round2(Math.min(amount, total));
      return capped > 0 ? post(-capped, 'withdraw') : Promise.resolve(false);
    },
    [post, total],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      setLoaded((prev) => prev.filter((e) => e.id !== id));
      try {
        await removeDamEntry(id);
      } catch {
        setError('remove');
        try {
          setLoaded((await listDam()).entries);
        } catch {
          /* keep the error state set above */
        }
      }
    },
    [userId],
  );

  return { entries, total, loading, adding, error, add, withdraw, remove };
}
