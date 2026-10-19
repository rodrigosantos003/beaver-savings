'use client';

import { SyntheticEvent, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

export function DeleteAccountCard() {
  const t = useTranslations('deleteAccount');
  const { data: session, isPending } = authClient.useSession();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [status, setStatus] = useState<'idle' | 'deleting' | 'deleted'>('idle');
  const [error, setError] = useState('');

  const confirmed = confirmation.trim().toLowerCase() === t('confirmWord').toLowerCase();
  const canSubmit = confirmed && password.length > 0 && status !== 'deleting';

  async function onSubmit(event: SyntheticEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setStatus('deleting');
    setError('');

    try {
      const { error } = await authClient.deleteUser({ password });

      if (error) {
        setStatus('idle');
        setError(t('failed'));
        return;
      }
    } catch (error) {
      console.error(error)
      setError(t('failedToFetch'));
      return;
    }

    setStatus('deleted');
  }

  if (isPending) {
    return <div className="h-80 animate-pulse rounded-2xl border border-stone-200 bg-white" />;
  }

  if (status === 'deleted') {
    return (
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">{t('deletedTitle')}</h1>
        <p className="mt-3 text-stone-600">{t('deletedBody')}</p>
        <Link
          href="/landing"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover"
        >
          {t('backHome')}
        </Link>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-3 text-stone-600">{t('signInRequired')}</p>
        <Link
          href="/sign-in"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-secondary px-5 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover"
        >
          {t('signIn')}
        </Link>
      </Card>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
      <div className="flex items-start gap-4 border-b border-red-100 bg-red-50 p-6">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <svg
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-red-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-red-800/80">{t('warning')}</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-6 p-6">
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{t('whatHappens')}</h2>
          <ul className="mt-3 space-y-2 text-sm text-stone-600">
            {(['item1', 'item2', 'item3'] as const).map((key) => (
              <li key={key} className="flex gap-2">
                <span className="mt-0.5 text-red-500" aria-hidden="true">
                  ✕
                </span>
                {t(key)}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-stone-500">
            {t('signedInAs', { email: session.user.email })}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-stone-700">
            {t('passwordLabel')}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-red-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="confirm" className="text-sm font-medium text-stone-700">
            {t('confirmLabel', { word: t('confirmWord') })}
          </label>
          <input
            id="confirm"
            type="text"
            autoComplete="off"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-red-400"
          />
        </div>

        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={!canSubmit}
            className="inline-flex h-11 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'deleting' ? t('deleting') : t('confirmButton')}
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">{children}</div>
  );
}
