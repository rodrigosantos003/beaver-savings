import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import { Currency, isCurrency } from 'savings-core';
import 'server-only';

export const CURRENCY_COOKIE = 'NEXT_CURRENCY';
const DEFAULT_CURRENCY: Currency = 'EUR';

const COUNTRY_CURRENCY: Record<string, Currency> = {
  CZ: 'CZK',
  DK: 'DKK',
  HU: 'HUF',
  PL: 'PLN',
  RO: 'RON',
  SE: 'SEK',
};

function currencyFromCountry(country?: string | null): Currency | null {
  return (country && COUNTRY_CURRENCY[country.toUpperCase()]) || null;
}

async function getSavedCurrency(cookieHeader: string): Promise<Currency | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-session`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      user?: { preferredCurrency?: string | null };
    } | null;

    const currency = data?.user?.preferredCurrency;
    return currency && isCurrency(currency) ? currency : null;
  } catch {
    return null;
  }
}

export const resolveCurrency = cache(async (): Promise<Currency> => {
  const cookieStore = await cookies();

  const hasSession = cookieStore.getAll().some((c) => c.name.includes('better-auth.session_token'));

  if (hasSession) {
    const saved = await getSavedCurrency(cookieStore.toString());
    if (saved) return saved;
  }

  const fromCookie = cookieStore.get(CURRENCY_COOKIE)?.value;
  if (fromCookie && isCurrency(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const fromGeo = currencyFromCountry(headerStore.get('x-vercel-ip-country'));
  if (fromGeo) return fromGeo;

  return DEFAULT_CURRENCY;
});
