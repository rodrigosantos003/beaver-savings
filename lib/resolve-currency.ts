import { cookies, headers } from 'next/headers';
import { cache } from 'react';

import 'server-only';

import { getSession } from '@/server/auth/session';
import { type Currency, isCurrency } from '@/shared/currency';

export const CURRENCY_COOKIE = 'NEXT_CURRENCY';
const DEFAULT_CURRENCY: Currency = 'EUR';

const COUNTRY_CURRENCY: Record<string, Currency> = {
  US: 'USD',
  GB: 'GBP',
  CH: 'CHF',
  BR: 'BRL',
  CA: 'CAD',
  AO: 'AOA',
  MZ: 'MZN',
  CV: 'CVE',
};

function currencyFromCountry(country?: string | null): Currency | null {
  return (country && COUNTRY_CURRENCY[country.toUpperCase()]) || null;
}

async function getSavedCurrency(): Promise<Currency | null> {
  const currency = (await getSession())?.user.preferredCurrency;
  return isCurrency(currency) ? currency : null;
}

export const resolveCurrency = cache(async (): Promise<Currency> => {
  const cookieStore = await cookies();

  const hasSession = cookieStore.getAll().some((c) => c.name.includes('better-auth.session_token'));

  if (hasSession) {
    const saved = await getSavedCurrency();
    if (saved) return saved;
  }

  const fromCookie = cookieStore.get(CURRENCY_COOKIE)?.value;
  if (fromCookie && isCurrency(fromCookie)) return fromCookie;

  const headerStore = await headers();
  const fromGeo = currencyFromCountry(headerStore.get('x-vercel-ip-country'));
  if (fromGeo) return fromGeo;

  return DEFAULT_CURRENCY;
});
