import type { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { getAlternates, getOpenGraph } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.signup');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/signup'),
    openGraph: getOpenGraph(locale, '/signup', { title, description }),
    robots: { index: false },
  };
}

export default function SignupPage() {
  return <AuthScreen mode="signup" />;
}
