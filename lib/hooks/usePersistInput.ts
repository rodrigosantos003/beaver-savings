import { useEffect, useRef } from 'react';

import type { SavingsInput } from 'savings-core';

import { saveCalculatorInput } from '../api/calculator';

export function usePersistInput(input: SavingsInput, enabled: boolean, delayMs = 3000) {
  const lastSaved = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const serialized = JSON.stringify(input);
    if (lastSaved.current === null) {
      lastSaved.current = serialized;
      return;
    }
    if (serialized === lastSaved.current) return;

    const id = setTimeout(() => {
      lastSaved.current = serialized;
      saveCalculatorInput(input).catch(() => {});
    }, delayMs);

    return () => clearTimeout(id);
  }, [input, enabled, delayMs]);
}
