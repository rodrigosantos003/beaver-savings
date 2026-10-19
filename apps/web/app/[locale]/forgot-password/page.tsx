import { Metadata } from 'next';

import { getLocale, getTranslations } from 'next-intl/server';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { getAlternates, getOpenGraph } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.forgotPassword');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/forgot-password'),
    openGraph: getOpenGraph(locale, '/forgot-password', { title, description }),
    robots: { index: false },
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-4 py-12">
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">{t('forgotPasswordTitle')}</h1>
      <ForgotPasswordForm />
    </div>
  );
}
