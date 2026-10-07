'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { type DamEntry, addDamEntry, listDam, removeDamEntry } from '../api/dam';

export type { DamEntry };
export type DamError = 'load' | 'add' | 'remove' | null;

export function useDam(userId?: string | null) {
  const [entries, setEntries] = useState<DamEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<DamError>(null);

  // Load whenever the user changes; ignore stale responses
  useEffect(() => {
    if (!userId) {
      setEntries([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listDam(userId)
      .then((res) => {
        if (!cancelled) setEntries(res.entries);
      })
      .catch(() => {
        if (!cancelled) setError('load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Resolves to true when the entry was saved, so callers can clear inputs
  const add = useCallback(
    async (amount: number, label?: string): Promise<boolean> => {
      if (!userId || !Number.isFinite(amount) || amount <= 0) return false;
      setAdding(true);
      setError(null);
      try {
        const created = await addDamEntry(userId, Math.round(amount * 100) / 100, label);
        setEntries((prev) => [created, ...prev]);
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

  // Optimistic: remove right away, resync from the server if it fails
  const remove = useCallback(
    async (id: string) => {
      if (!userId) return;
      setError(null);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      try {
        await removeDamEntry(userId, id);
      } catch {
        setError('remove');
        try {
          setEntries((await listDam(userId)).entries);
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
