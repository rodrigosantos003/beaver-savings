// src/lib/seo.ts
import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';

export const OG_LOCALES: Record<string, string> = {
  en: 'en_GB',
  pt: 'pt_PT',
};

export function getAlternates(locale: string, path = ''): Metadata['alternates'] {
  const url = (l: string) => `/${l}${path}`;

  return {
    canonical: url(locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, url(l)])),
      'x-default': url(routing.defaultLocale),
    },
  };
}

export function getOpenGraph(
  locale: string,
  path: string,
  overrides: NonNullable<Metadata['openGraph']> = {},
): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    url: `/${locale}${path}`,
    locale: OG_LOCALES[locale] ?? locale,
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l] ?? l),
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    ...overrides,
  };
}
