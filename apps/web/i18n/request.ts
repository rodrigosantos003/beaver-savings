import { locale as getRootLocale } from 'next/root-params';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from './routing';

export default getRequestConfig(async ({ locale: localeOverride }) => {
  let locale = localeOverride;

  if (!locale) {
    const paramValue = await getRootLocale();

    if (hasLocale(routing.locales, paramValue)) {
      locale = paramValue;
    } else if (!paramValue) {
      locale = routing.defaultLocale;
    } else {
      notFound();
    }
  }

  return {
    locale,
    messages: (await import(`../languages/${locale}.json`)).default,
  };
});
