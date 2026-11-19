// components/auth/CredentialsForm.tsx
'use client';

import { SyntheticEvent, useEffect, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { PasskeyIcon } from '@/components/auth/PasskeyIcon';
import { Link, useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import type { CurrencyOption } from '@/lib/currencies';
import { isPasskeyCancelled, supportsPasskeyAutofill, usePasskeySupport } from '@/lib/passkey';
import { type Currency, DEFAULT_CURRENCY, isCurrency } from '@/shared/currency';

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100';

type CredentialsFormProps = {
  mode: 'login' | 'signup';
  compact?: boolean;
  defaultCurrency?: Currency; // resolved on the server (geo guess)
  currencies?: CurrencyOption[]; // built on the server, never on the client
};

export function CredentialsForm({
  mode,
  compact = false,
  defaultCurrency = DEFAULT_CURRENCY,
  currencies = [],
}: CredentialsFormProps) {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState<Currency>(defaultCurrency);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isSignup = mode === 'signup';
  const passkeySupported = usePasskeySupport();
  // Autofill (conditional mediation) only on the full login page: one pending request per page.
  const passkeyAutofill = !isSignup && !compact;
  // Bumped when the passkey button's own ceremony ends. Starting that ceremony aborts the
  // autofill request, so this re-arms the email field's passkey suggestions afterwards.
  const [autofillRun, setAutofillRun] = useState(0);

  useEffect(() => {
    if (!passkeyAutofill) return;

    let active = true;

    (async () => {
      if (!(await supportsPasskeyAutofill()) || !active) return;

      // Resolves once the user picks a passkey from the email field's suggestions. Errors
      // (including the abort when the passkey button starts its own prompt) are ignored.
      const result = await authClient.signIn.passkey({ autoFill: true });

      if (active && result.data) {
        router.push('/calculator');
        router.refresh();
      }
    })().catch(() => {});

    return () => {
      active = false;
    };
  }, [passkeyAutofill, router, autofillRun]);

  async function onPasskeySignIn() {
    setError(null);
    setPending(true);

    try {
      const result = await authClient.signIn.passkey();

      if (result.error) {
        if (!isPasskeyCancelled(result.error)) setError(t('passkeyLoginFailed'));
        setAutofillRun((run) => run + 1);
        return;
      }

      router.push('/calculator');
      router.refresh();
    } catch (error) {
      console.error(error);
      setError(t('failedToFetch'));
      setAutofillRun((run) => run + 1);
    } finally {
      setPending(false);
    }
  }

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const result = isSignup
        ? await authClient.signUp.email({
            name,
            email,
            password,
            preferredCurrency: currency,
          })
        : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(t(isSignup ? 'signupFailed' : 'loginFailed'));
        return;
      }

      if (isSignup)
        await authClient.sendVerificationEmail({
          email,
          callbackURL: '/',
          fetchOptions: {
            headers: {
              'Content-Language': locale,
            },
          },
        });

      router.push('/calculator');
      router.refresh(); // re-render server components (header, etc.) with the new session
    } catch (error) {
      console.error(error);
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
          autoComplete={passkeyAutofill ? 'email webauthn' : 'email'}
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
              prefetch={false}
            >
              {t('forgotPassword')}
            </Link>
          </div>
        ) : null}
      </div>
      {isSignup && currencies.length > 0 ? (
        <label className="block text-sm font-medium text-stone-700">
          {t('preferredCurrency')}
          <select
            className={fieldClass}
            name="preferredCurrency"
            value={currency}
            onChange={(event) => {
              const next = event.target.value;
              if (isCurrency(next)) setCurrency(next);
            }}
          >
            {currencies.map(({ code, name }) => (
              <option key={code} value={code}>
                {code} · {name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {error ? <p className="rounded-xl bg-danger px-3 py-2 text-sm text-white">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
      >
        {pending ? t('submitting') : t(isSignup ? 'submitSignup' : 'submitLogin')}
      </button>
      {!isSignup && passkeySupported ? (
        <>
          <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-stone-400">
            <span className="h-px flex-1 bg-stone-200" />
            {t('or')}
            <span className="h-px flex-1 bg-stone-200" />
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onPasskeySignIn}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-50 disabled:opacity-60"
          >
            <PasskeyIcon />
            {t('passkeyLogin')}
          </button>
        </>
      ) : null}
      <p className="text-sm text-stone-500">
        {isSignup ? t('haveAccount') : t('needAccount')}{' '}
        <Link
          href={isSignup ? '/login' : '/signup'}
          className="font-medium text-beaver-700 hover:text-beaver-900"
          prefetch={false}
        >
          {isSignup ? t('loginLink') : t('signupLink')}
        </Link>
      </p>
      <p className="text-sm text-stone-500">
        {t('acceptTerms')}{' '}
        <Link
          href="/terms-and-conditions"
          className="font-medium text-beaver-700 hover:text-beaver-900"
          prefetch={false}
        >
          {t('termsAndConditions')}
        </Link>
      </p>
    </form>
  );
}
