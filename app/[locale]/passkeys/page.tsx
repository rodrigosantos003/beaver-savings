import type { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { PasskeysCard } from '@/components/account/PasskeysCard';
import { getAlternates, getOpenGraph } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.passkeys');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/passkeys'),
    openGraph: getOpenGraph(locale, '/passkeys', { title, description }),
    robots: { index: false },
  };
}

export default function PasskeysPage() {
  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-12">
        <PasskeysCard />
      </main>
    </div>
  );
}
