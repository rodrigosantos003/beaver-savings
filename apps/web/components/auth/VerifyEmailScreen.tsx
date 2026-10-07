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
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-6">
          <Link href="/landing" className="flex items-center gap-2.5">
            <Image src="/beaver-savings.png" alt="Beaver Savings" width={42} height={42} />
            <span className="text-lg font-semibold tracking-tight text-beaver-900">
              Beaver Savings
            </span>
          </Link>
        </div>
      </header>
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
