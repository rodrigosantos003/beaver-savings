import type { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { Calculator } from '@/components/calculator/Calculator';
import {
  getCalculatorHabitsServer,
  getDamServer,
  getLatestCalculatorInputServer,
  getServerSession,
} from '@/lib/api/calculator.server';
import { getAlternates, getOpenGraph } from '@/lib/seo';

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
  const session = await getServerSession();
  const userId = session?.user.id;

  const [savedInput, habits, damEntries] = await Promise.all([
    getLatestCalculatorInputServer(),
    getCalculatorHabitsServer(),
    getDamServer(),
  ]);

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      {/* Logged-in users get the coach sidebar, so give the page room for a third column. */}
      <main
        className={`mx-auto w-full flex-1 px-6 py-10 print:max-w-none print:px-0 print:py-4 ${
          userId ? 'max-w-7xl' : 'max-w-6xl'
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
            preferredCurrency={session?.user.preferredCurrency}
            habits={habits}
            savedInput={savedInput ?? null}
            damEntries={damEntries}
          />
        </div>
      </main>
    </div>
  );
}
