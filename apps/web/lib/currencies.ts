import { cache } from 'react';

import { CURRENCIES } from 'savings-core';
import 'server-only';

export type CurrencyOption = { code: string; name: string };

export const getCurrencyOptions = cache((locale: string): CurrencyOption[] => {
  const names = new Intl.DisplayNames([locale], { type: 'currency' });
  return CURRENCIES.map((code) => ({ code, name: names.of(code) ?? code }));
});
