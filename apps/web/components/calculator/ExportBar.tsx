'use client';

import { SyntheticEvent, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import { SavingsInput } from 'savings-core';

import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/constants';

type ExportBarProps = {
  input: SavingsInput;
};

export function ExportBar({ input }: ExportBarProps) {
  const t = useTranslations('calculator');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function sendEmail(event: SyntheticEvent) {
    event.preventDefault();
    setStatus('sending');
    setError('');

    try {
      const { data: session } = await authClient.getSession();

      if (!session) {
        setStatus('error');
        setError(t('signInRequired'));
        return;
      }

      const response = await fetch(`${API_URL}/savings/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, to: email, locale }),
        credentials: 'include',
      });
      const data = await readJson(response);

      if (!response.ok) {
        throw new Error(messageFrom(data, t('emailFailed')));
      }

      setStatus('sent');
    } catch (sendError) {
      setStatus('error');
      setError(t('emailFailed'));
    }
  }

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm print:hidden sm:flex-row sm:items-end sm:justify-between">
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
      >
        {t('exportPdf')}
      </button>
      <form className="flex flex-1 flex-col gap-2 sm:max-w-md" onSubmit={sendEmail}>
        <label className="text-sm font-medium text-stone-700" htmlFor="email">
          {t('email')}
        </label>
        <div className="flex gap-2">
          <input
            id="email"
            type="email"
            required
            value={email}
            placeholder={t('emailPlaceholder')}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status !== 'idle') {
                setStatus('idle');
              }
            }}
            className="w-full rounded-full border border-stone-200 px-4 py-2 text-sm outline-none focus:border-beaver-400"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
          >
            {status === 'sending' ? t('sending') : t('send')}
          </button>
        </div>
        {status === 'sent' ? <p className="text-sm text-secondary">{t('sent')}</p> : null}
        {status === 'error' ? <p className="text-sm text-danger">{error}</p> : null}
      </form>
    </section>
  );
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function messageFrom(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return fallback;
  }

  const message = data.message;

  if (typeof message === 'string' && message.length > 0) {
    return message;
  }

  return fallback;
}
