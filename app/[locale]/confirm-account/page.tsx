import { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { VerifyEmailScreen } from '@/components/auth/VerifyEmailScreen';
import { getAlternates, getOpenGraph } from '@/lib/seo';

type PageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.confirmAccount');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/confirm-account'),
    openGraph: getOpenGraph(locale, '/confirm-account', { title, description }),
    robots: { index: false },
  };
}

export default async function ConfirmAccountPage({ searchParams }: PageProps) {
  const { token, error } = await searchParams;
  return <VerifyEmailScreen token={token} error={error} />;
}
