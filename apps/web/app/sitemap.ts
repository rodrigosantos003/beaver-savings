import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const ptAlernate = `${SITE_URL}/pt`;
  const enAlternate = `${SITE_URL}/en`;

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: ptAlernate,
          en: enAlternate,
        },
      },
    },
    {
      url: `${SITE_URL}/landing`,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: `${ptAlernate}/landing`,
          en: `${enAlternate}/landing`,
        },
      },
    },
    {
      url: `${SITE_URL}/calculator`,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: `${ptAlernate}/calculator`,
          en: `${enAlternate}/calculator`,
        },
      },
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: `${ptAlernate}/privacy-policy`,
          en: `${enAlternate}/privacy-policy`,
        },
      },
    },
  ];
}
