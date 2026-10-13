import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://beaver-savings.vercel.app';
  const ptAlernate = `${baseUrl}/pt`;
  const enAlternate = `${baseUrl}/en`;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: ptAlernate,
          en: enAlternate,
        },
      },
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: `${ptAlernate}/landing`,
          en: `${enAlternate}/landing`,
        },
      },
    },
    {
      url: `${baseUrl}/calculator`,
      lastModified: new Date(),
      alternates: {
        languages: {
          pt: `${ptAlernate}/calculator`,
          en: `${enAlternate}/calculator`,
        },
      },
    },
    {
      url: `${baseUrl}/privacy-policy`,
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
