'use client';

import { SyntheticEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { Link, useRouter } from '@/i18n/navigation';

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100';

type CredentialsFormProps = {
  mode: 'login' | 'signup';
  compact?: boolean;
};

export function CredentialsForm({ mode, compact = false }: CredentialsFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignup = mode === 'signup';

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result = isSignup
        ? await authClient.signUp.email({ name, email, password })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(t(isSignup ? 'signupFailed' : 'loginFailed'));
        return;
      }

      if (isSignup) await authClient.sendVerificationEmail({
        email, callbackURL: '/', fetchOptions: {
          headers: {
            'Content-Language': locale
          }
        }
      });

      router.push('/calculator');
    } catch (error) {
      setError(t('failedToFetch'));
      return;
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={compact ? 'grid gap-3' : 'grid gap-4'} onSubmit={onSubmit}>
      {isSignup ? (
        <label className="block text-sm font-medium text-stone-700">
          {t('name')}
          <input
            className={fieldClass}
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
      ) : null}
      <label className="block text-sm font-medium text-stone-700">
        {t('email')}
        <input
          className={fieldClass}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t('password')}
          <input
            className={fieldClass}
            type="password"
            name="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {!isSignup ? (
          <div className="mt-1 text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-beaver-700 hover:text-beaver-900"
            >
              {t('forgotPassword')}
            </Link>
          </div>
        ) : null}
      </div>
      {error ? <p className="rounded-xl bg-danger px-3 py-2 text-sm text-white">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
      >
        {pending ? t('submitting') : t(isSignup ? 'submitSignup' : 'submitLogin')}
      </button>
      <p className="text-sm text-stone-500">
        {isSignup ? t('haveAccount') : t('needAccount')}{' '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-medium text-beaver-700 hover:text-beaver-900"
        >
          {isSignup ? t('loginLink') : t('signupLink')}
        </Link>
      </p>
      <p className="text-sm text-stone-500">
        {t('acceptTerms')}{' '}
        <Link
          href="/terms-and-conditions"
          className="font-medium text-beaver-700 hover:text-beaver-900"
        >
          {t('termsAndConditions')}
        </Link>
      </p>
    </form>
  );
}