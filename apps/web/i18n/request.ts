import { notFound } from 'next/navigation';
import { locale as getRootLocale } from 'next/root-params';

import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from './routing';

export default getRequestConfig(async ({ locale: localeOverride }) => {
  const candidate = localeOverride ?? (await getRootLocale());

  let locale: (typeof routing.locales)[number];

  if (hasLocale(routing.locales, candidate)) {
    locale = candidate;
  } else if (!candidate) {
    locale = routing.defaultLocale;
  } else {
    notFound();
  }

  return {
    locale,
    messages: (await import(`../languages/${locale}.json`)).default,
  };
});