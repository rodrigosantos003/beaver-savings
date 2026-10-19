import { Suspense } from 'react';

import { getLocale, getTranslations } from 'next-intl/server';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { getAlternates, getOpenGraph } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta.resetPassword');
  const locale = await getLocale();

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    alternates: getAlternates(locale, '/reset-password'),
    openGraph: getOpenGraph(locale, '/reset-password', { title, description }),
    robots: { index: false }
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth' });

  return (
    <div className="flex min-h-full flex-col bg-white text-stone-900">
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <h1 className="mb-6 text-2xl font-semibold text-stone-900">{t('resetPasswordTitle')}</h1>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
