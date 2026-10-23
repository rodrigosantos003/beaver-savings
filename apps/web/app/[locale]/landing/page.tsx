import { Metadata } from 'next';
import Image from 'next/image';

import { getLocale, getTranslations } from 'next-intl/server';

import { RiverWaveBackground } from '@/components/RiverWaveBackground';
import { Link } from '@/i18n/navigation';
import { getAlternates, getOpenGraph } from '@/lib/seo';

const ctaClass =
  'inline-flex items-center justify-center rounded-full bg-secondary font-semibold text-white transition-colors hover:bg-secondary-hover';

type FeatureItem = {
  title: string;
  description: string;
  icon: string;
};

type StepItem = {
  step: string;
  title: string;
  description: string;
};

type StatItem = {
  label: string;
  sub: string;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/'),
    openGraph: getOpenGraph(locale, '/', { title, description }),
  };
}

export default async function LandingPage() {
  const t = await getTranslations();

  const stats = [
    {
      ...(t.raw('stats.netIncome') as StatItem),
      value: '€2,340',
      accent: false,
    },
    {
      ...(t.raw('stats.monthlySavings') as StatItem),
      value: '€350',
      accent: true,
    },
    {
      ...(t.raw('stats.yearEndTotal') as StatItem),
      value: '€4,200',
      accent: false,
    },
  ];

  const featureItems = t.raw('features.items') as FeatureItem[];
  const stepItems = t.raw('steps.items') as StepItem[];

  return (
    <div className="flex min-h-full flex-col bg-white text-stone-900">
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-20 pt-16 sm:pb-28 sm:pt-24">
          <RiverWaveBackground />
          <div className="relative z-10 mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
                {t('hero.title')}
              </h1>
              <p className="mt-2 text-xl font-medium text-secondary sm:text-2xl">
                {t('hero.subtitle')}
              </p>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
                {t('hero.description')}
              </p>
              <div
                id="get-started"
                className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
                <Link
                  href="/calculator"
                  className={`${ctaClass} h-12 w-full px-8 text-base sm:w-auto`}
                  prefetch={false}
                >
                  {t('hero.exploreFeatures')}
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-stone-200 bg-white px-8 text-base font-semibold text-stone-700 transition-colors hover:bg-stone-50 sm:w-auto"
                >
                  {t('hero.seeHowItWorks')}
                </Link>
              </div>
            </div>

            <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-2xl border p-6 text-center shadow-sm ${
                    stat.accent ? 'border-beaver-200 bg-beaver-50' : 'border-stone-200 bg-white'
                  }`}
                >
                  <p className="text-sm font-medium text-stone-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
                    {stat.value}
                  </p>
                  <p
                    className={`mt-1 text-sm ${stat.accent ? 'text-secondary' : 'text-stone-500'}`}
                  >
                    {stat.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-stone-200 bg-stone-50 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {t('features.title')}
              </h2>
              <p className="mt-4 text-lg text-stone-600">{t('features.description')}</p>
            </div>
            <ul className="mt-14 flex flex-wrap justify-center gap-6">
              {featureItems.map((feature) => (
                <li
                  key={feature.title}
                  className="w-full rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
                >
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-beaver-50 text-xl"
                    aria-hidden
                  >
                    {feature.icon}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
                {t('steps.title')}
              </h2>
              <p className="mt-4 text-lg text-stone-600">{t('steps.description')}</p>
            </div>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {stepItems.map((item) => (
                <li key={item.step} className="relative text-center md:text-left">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-beaver-100 text-lg font-bold text-beaver-700">
                    {item.step}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-stone-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-beaver-800 bg-stone-400 px-6 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
            <Image src="/beaver-savings.png" alt="Beaver Savings" width={50} height={50} />
            <h2 className="max-w-xl text-2xl font-bold tracking-tight text-beaver-50 sm:text-3xl">
              {t('cta.title')}
            </h2>
            <p className="max-w-lg text-beaver-100">{t('cta.description')}</p>
            <Link href="/signup" className={`${ctaClass} h-12 px-8 text-base`}>
              {t('cta.button')}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
