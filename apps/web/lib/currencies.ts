import { cache } from 'react';

import { CURRENCIES } from 'savings-core';

export type CurrencyOption = { code: string; name: string };

export const getCurrencyOptions = cache((locale: string): CurrencyOption[] => {
  const names = new Intl.DisplayNames([locale], { type: 'currency' });
  return CURRENCIES.map((code) => ({ code, name: names.of(code) ?? code }));
});

export function currencySymbol(code: string, locale: string): string {
  try {
    return (
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        currencyDisplay: 'narrowSymbol',
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value ?? code
    );
  } catch {
    return code;
  }
}
