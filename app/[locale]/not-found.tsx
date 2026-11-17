import { Metadata } from 'next';
import Image from 'next/image';

import { getTranslations } from 'next-intl/server';

import { RiverWaveBackground } from '@/components/RiverWaveBackground';
import { Link } from '@/i18n/navigation';

const ctaClass =
  'inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-white transition-colors hover:bg-secondary-hover';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound');

  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <div className="flex min-h-full flex-col bg-white text-stone-900">
      <main className="flex-1">
        <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-6 py-20">
          <RiverWaveBackground />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <Image
              src="/beaver-savings.png"
              alt=""
              width={72}
              height={72}
              className="mx-auto"
              aria-hidden
            />
            <p className="mt-6 text-7xl font-bold tracking-tight text-secondary sm:text-8xl">404</p>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-stone-600">
              {t('description')}
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/" className={`${ctaClass} h-12 w-full px-8 text-base sm:w-auto`}>
                {t('backHome')}
              </Link>
              <Link
                href="/calculator"
                prefetch={false}
                className="inline-flex h-12 w-full items-center justify-center rounded-full border border-stone-200 bg-white px-8 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50 sm:w-auto"
              >
                {t('openCalculator')}
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
