import type { Metadata } from 'next';

import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/lib/constants';

export const OG_LOCALES: Record<string, string> = {
  en: 'en_GB',
  pt: 'pt_PT',
};

export const OG_IMAGE = { url: '/beaver-savings.png', width: 1254, height: 1254 };

/**
 * Public, crawlable path for a page in a given locale. Mirrors the
 * `localePrefix: 'as-needed'` routing: the default locale has no prefix,
 * every other locale is prefixed (e.g. `/landing` vs `/en/landing`).
 */
export function localizedPath(locale: string, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (locale === routing.defaultLocale) return normalized;
  return normalized === '/' ? `/${locale}` : `/${locale}${normalized}`;
}

export function localizedUrl(locale: string, path = '/'): string {
  return `${SITE_URL}${localizedPath(locale, path)}`;
}

export function getAlternates(locale: string, path = '/'): Metadata['alternates'] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, localizedPath(l, path)])),
      'x-default': localizedPath(routing.defaultLocale, path),
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
    url: localizedPath(locale, path),
    locale: OG_LOCALES[locale] ?? locale,
    alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l] ?? l),
    images: [OG_IMAGE],
    ...overrides,
  };
}
