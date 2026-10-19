import type { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { getAlternates, getOpenGraph } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.login');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/login'),
    openGraph: getOpenGraph(locale, '/login', { title, description }),
    robots: { index: false },
  };
}

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
