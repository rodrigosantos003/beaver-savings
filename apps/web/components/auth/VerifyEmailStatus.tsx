'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client'; // adjust to your client path

type Status = 'loading' | 'success' | 'error';

type VerifyEmailStatusProps = {
  token?: string;
  initialError?: string;
};

export function VerifyEmailStatus({ token, initialError }: VerifyEmailStatusProps) {
  const t = useTranslations('auth');
  const [status, setStatus] = useState<Status>(token && !initialError ? 'loading' : 'error');
  // Tokens are single-use, and React strict mode runs effects twice in dev.
  const started = useRef(false);

  useEffect(() => {
    if (!token || initialError || started.current) return;
    started.current = true;

    authClient
      .verifyEmail({ query: { token } })
      .then(({ error }) => setStatus(error ? 'error' : 'success'))
      .catch(() => setStatus('error'));
  }, [token, initialError]);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-3 text-stone-600" role="status">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-stone-300 border-t-beaver-900" />
        <span>{t('verifyLoading')}</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <p className="font-medium text-green-700">{t('verifySuccess')}</p>
        <Link
          href="/"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-beaver-900 px-4 text-sm font-medium text-white hover:opacity-90"
        >
          {t('verifyContinue')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-medium text-red-700">{t('verifyError')}</p>
      <p className="text-sm text-stone-600">{t('verifyErrorHint')}</p>
      <Link
        href="/login"
        className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-stone-300 px-4 text-sm font-medium text-stone-900 hover:bg-stone-50"
      >
        {t('backToLogin')}
      </Link>
    </div>
  );
}
