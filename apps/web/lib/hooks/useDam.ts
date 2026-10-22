'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { type DamEntry, addDamEntry, listDam, removeDamEntry } from '../api/dam';

export type { DamEntry };
export type DamError = 'load' | 'add' | 'remove' | null;

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
    listDam(userId)
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

  const add = useCallback(
    async (amount: number): Promise<boolean> => {
      if (!userId || !Number.isFinite(amount) || amount <= 0) return false;
      setAdding(true);
      setError(null);
      try {
        const created = await addDamEntry(userId, Math.round(amount * 100) / 100);
        setLoaded((prev) => [created, ...prev]);
        return true;
      } catch {
        setError('add');
        return false;
      } finally {
        setAdding(false);
      }
    },
    [userId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      setLoaded((prev) => prev.filter((e) => e.id !== id));
      try {
        await removeDamEntry(userId, id);
      } catch {
        setError('remove');
        try {
          setLoaded((await listDam(userId)).entries);
        } catch {
          /* keep the error state set above */
        }
      }
    },
    [userId],
  );

  const total = useMemo(
    () => Math.round(entries.reduce((sum, e) => sum + e.amount, 0) * 100) / 100,
    [entries],
  );

  return { entries, total, loading, adding, error, add, remove };
}
