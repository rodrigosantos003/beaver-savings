import { Metadata } from 'next';
import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import { OfflineRetry } from '@/components/OfflineRetry';
import { RiverWaveBackground } from '@/components/RiverWaveBackground';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('offline');

  return {
    title: t('metaTitle'),
    robots: { index: false, follow: false },
  };
}

/** Precached by the service worker and served in place of any page that fails to load offline. */
export default async function OfflinePage() {
  const t = await getTranslations('offline');

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-stone-900">
      <section className="relative flex flex-1 items-center overflow-hidden px-6 py-20">
        <RiverWaveBackground />
        <div className="relative z-10 mx-auto max-w-xl text-center">
          <Image
            src="/beaver-savings.png"
            alt=""
            width={72}
            height={72}
            // The optimised /_next/image URL is not precached; the raw public file is.
            unoptimized
            className="mx-auto"
            aria-hidden
          />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-600">{t('description')}</p>
          <div className="mt-10">
            <OfflineRetry label={t('retry')} />
          </div>
        </div>
      </section>
    </div>
  );
}
