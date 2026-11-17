import type { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { Calculator } from '@/components/calculator/Calculator';
import { getAlternates, getOpenGraph } from '@/lib/seo';
import { getCalculatorPageData } from '@/server/calculator/page-data';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.calculator');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/calculator'),
    openGraph: getOpenGraph(locale, '/calculator', { title, description }),
  };
}

export default async function CalculatorPage() {
  const t = await getTranslations('calculator');
  const { user, savedInput, habits, damEntries } = await getCalculatorPageData();
  const userId = user?.id;

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      {/* Bottom padding keeps the last card clear of the floating coach button. */}
      <main
        className={`mx-auto w-full max-w-6xl flex-1 px-6 py-10 print:max-w-none print:px-0 print:py-4 ${
          userId ? 'pb-24' : ''
        }`}
      >
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-stone-600">{t('description')}</p>
        <div className="mt-8">
          <Calculator
            key={userId ?? 'anonymous'}
            userId={userId}
            preferredCurrency={user?.preferredCurrency}
            habits={habits}
            savedInput={savedInput}
            damEntries={damEntries}
          />
        </div>
      </main>
    </div>
  );
}
