import { useEffect, useRef, useState } from 'react';

import type { SavingsInput } from '@/shared/savings/types';

import { saveCalculatorInput } from '../api/calculator';

export function usePersistInput(input: SavingsInput, enabled: boolean, delayMs = 3000) {
  const lastSaved = useRef<string | null>(null);
  // Bumped when the connection returns so a save that failed offline is retried.
  const [reconnects, setReconnects] = useState(0);

  useEffect(() => {
    const onOnline = () => setReconnects((count) => count + 1);
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const serialized = JSON.stringify(input);
    if (lastSaved.current === null) {
      lastSaved.current = serialized;
      return;
    }
    if (serialized === lastSaved.current) return;

    const id = setTimeout(() => {
      saveCalculatorInput(input)
        .then(() => {
          lastSaved.current = serialized;
        })
        .catch(() => {});
    }, delayMs);

    return () => clearTimeout(id);
  }, [input, enabled, delayMs, reconnects]);
}
