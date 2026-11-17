import { getLocale, getTranslations } from 'next-intl/server';

import { CredentialsForm } from '@/components/auth/CredentialsForm';
import { getCurrencyOptions } from '@/lib/currencies';
import { resolveCurrency } from '@/lib/resolve-currency';

type AuthScreenProps = {
  mode: 'login' | 'signup';
};

export async function AuthScreen({ mode }: AuthScreenProps) {
  const t = await getTranslations('auth');
  const locale = await getLocale();
  const currencies = getCurrencyOptions(locale);
  const defaultCurrency = await resolveCurrency();

  const isSignup = mode === 'signup';

  return (
    <div className="flex min-h-full flex-col bg-stone-50 text-stone-900">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900">
          {t(isSignup ? 'signupTitle' : 'loginTitle')}
        </h1>
        <p className="mt-3 text-stone-600">
          {t(isSignup ? 'signupDescription' : 'loginDescription')}
        </p>
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <CredentialsForm mode={mode} defaultCurrency={defaultCurrency} currencies={currencies} />
        </div>
      </main>
    </div>
  );
}
