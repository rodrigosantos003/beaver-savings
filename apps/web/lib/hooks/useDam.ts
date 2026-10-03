"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type DamEntry = {
    id: string;
    amount: number;
    label?: string;
    createdAt: string;
};

export function useDam(userId?: string | null) {
    const key = userId ? `beaver-dam:${userId}` : null;
    const [entries, setEntries] = useState<DamEntry[]>([]);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setReady(false);
        if (!key) {
            setEntries([]);
            return;
        }
        try {
            const raw = localStorage.getItem(key);
            setEntries(raw ? JSON.parse(raw) : []);
        } catch {
            setEntries([]);
        }
        setReady(true);
    }, [key]);

    useEffect(() => {
        if (!key || !ready) return;
        try {
            localStorage.setItem(key, JSON.stringify(entries));
        } catch { }
    }, [entries, key, ready]);

    const add = useCallback((amount: number, label?: string) => {
        if (!Number.isFinite(amount) || amount <= 0) return false;
        const entry: DamEntry = {
            id: crypto.randomUUID(),
            amount: Math.round(amount * 100) / 100,
            label,
            createdAt: new Date().toISOString(),
        };
        setEntries((prev) => [entry, ...prev]);
        return true;
    }, []);

    const remove = useCallback((id: string) => {
        setEntries((prev) => prev.filter((e) => e.id !== id));
    }, []);

    const total = useMemo(
        () => Math.round(entries.reduce((sum, e) => sum + e.amount, 0) * 100) / 100,
        [entries],
    );

    return { entries, total, add, remove };
}