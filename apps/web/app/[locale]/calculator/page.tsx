import type { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { getAlternates, getOpenGraph } from '@/lib/seo';
import { Calculator } from '@/components/calculator/Calculator';

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

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 print:max-w-none print:px-0 print:py-4">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-stone-600">{t('description')}</p>
        <div className="mt-8">
          <Calculator />
        </div>
      </main>
    </div>
  );
}
