import type { MetadataRoute } from 'next';

import { routing } from '@/i18n/routing';
import { localizedUrl } from '@/lib/seo';

const PUBLIC_PATHS = ['/landing', '/calculator', '/privacy-policy', '/terms-and-conditions'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_PATHS.flatMap((path) => {
    const languages = {
      ...Object.fromEntries(routing.locales.map((l) => [l, localizedUrl(l, path)])),
      'x-default': localizedUrl(routing.defaultLocale, path),
    };

    return routing.locales.map((locale) => ({
      url: localizedUrl(locale, path),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: path === '/landing' ? 1 : 0.7,
      alternates: { languages },
    }));
  });
}
