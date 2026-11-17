'use client';

import { useSearchParams } from 'next/navigation';
import { SyntheticEvent, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

const fieldClass =
  'mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-beaver-400 focus:ring-2 focus:ring-beaver-100';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const invalidToken = !token || searchParams.get('error') === 'INVALID_TOKEN';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError(t('passwordsDontMatch'));
      return;
    }

    setPending(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token: token!,
      });

      if (result.error) {
        setError(t('resetFailed'));
        return;
      }

      router.push('/login');
    } catch {
      setError(t('failedToFetch'));
    } finally {
      setPending(false);
    }
  }

  if (invalidToken) {
    return (
      <div className="grid gap-4">
        <p className="rounded-xl bg-danger px-3 py-2 text-sm text-white">{t('invalidResetLink')}</p>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-beaver-700 hover:text-beaver-900"
        >
          {t('requestNewLink')}
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-4" onSubmit={onSubmit}>
      <label className="block text-sm font-medium text-stone-700">
        {t('newPassword')}
        <input
          className={fieldClass}
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      <label className="block text-sm font-medium text-stone-700">
        {t('confirmPassword')}
        <input
          className={fieldClass}
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </label>
      {error ? <p className="rounded-xl bg-danger px-3 py-2 text-sm text-white">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
      >
        {pending ? t('submitting') : t('resetPassword')}
      </button>
    </form>
  );
}
