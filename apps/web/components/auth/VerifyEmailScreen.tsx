import { getTranslations } from 'next-intl/server';
import { VerifyEmailStatus } from '@/components/auth/VerifyEmailStatus';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

type VerifyEmailScreenProps = {
  token?: string;
  error?: string;
};

export async function VerifyEmailScreen({ token, error }: VerifyEmailScreenProps) {
  const t = await getTranslations('auth');

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">{t('verifyTitle')}</h1>
        <p className="mt-3 text-stone-600">{t('verifyDescription')}</p>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <VerifyEmailStatus token={token} initialError={error} />
        </div>
      </main>
    </div>
  );
}
