'use client';

import { SyntheticEvent, useState } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import { authClient } from '@/lib/auth-client';
import { API_URL } from '@/lib/constants';
import { isIOS, isStandalone } from '@/lib/pwa';
import { downloadFile, shareFile } from '@/lib/share-file';
import type { Currency } from '@/shared/currency';
import { buildSavingsPdf } from '@/shared/savings/savings-pdf';
import type { SavingsInput } from '@/shared/savings/types';

type ExportBarProps = {
  input: SavingsInput;
  monthNames: string[];
  /** The currency the calculator shows, so the email matches what the user sees. */
  currency: Currency;
};

export function ExportBar({ input, monthNames, currency }: ExportBarProps) {
  const t = useTranslations('calculator');
  const locale = useLocale();
  // The server only ever sends to the signed-in user's own address, so show that one.
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function sendEmail(event: SyntheticEvent) {
    event.preventDefault();
    setStatus('sending');

    try {
      const response = await fetch(`${API_URL}/savings/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, currency, locale }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Savings email failed with status ${response.status}`);
      }

      setStatus('sent');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  // window.print() does nothing useful in the installed iOS app (no browser chrome to show the
  // print sheet from), so build the PDF here and hand it to the share sheet instead.
  // Kept synchronous up to navigator.share so the tap's user activation is still valid.
  function exportPdf() {
    if (!(isIOS() && isStandalone())) {
      window.print();
      return;
    }

    const bytes = buildSavingsPdf({
      input,
      currency,
      locale,
      labels: {
        title: t('title'),
        monthTitle: t('monthTitle'),
        monthHint: t(input.subsidiesInTwelfths ? 'monthHintTwelfths' : 'monthHint'),
        annualTitle: t('annualTitle'),
        annualHint: t(input.subsidiesInTwelfths ? 'annualHintTwelfths' : 'annualHint'),
        net: t('net'),
        expenses: t('expensesLabel'),
        disposable: t('disposable'),
        savings: t('savings'),
        remaining: t('remaining'),
        cumulative: t('cumulative'),
        month: t('month'),
        total: t('total'),
        warning: t('warning'),
      },
      monthNames,
      generatedAt: new Date(),
    });
    const file = new File(
      [bytes],
      `beaver-savings-plan-${new Date().toISOString().slice(0, 10)}.pdf`,
      { type: 'application/pdf' },
    );

    void shareFile(file).then((shared) => {
      if (!shared) downloadFile(file);
    });
  }

  const email = session?.user.email;

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm print:hidden sm:flex-row sm:items-end sm:justify-between">
      <button
        type="button"
        onClick={exportPdf}
        className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 px-5 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
      >
        {t('exportPdf')}
      </button>
      <form className="flex flex-1 flex-col gap-2 sm:max-w-md" onSubmit={sendEmail}>
        <p className="text-sm font-medium text-stone-700">{t('email')}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm text-stone-500">
            {email ? t('emailTo', { email }) : null}
          </p>
          <button
            type="submit"
            disabled={!email || status === 'sending'}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-secondary px-4 text-sm font-semibold text-white transition-colors hover:bg-secondary-hover disabled:opacity-60"
          >
            {status === 'sending' ? t('sending') : t('send')}
          </button>
        </div>
        {status === 'sent' ? <p className="text-sm text-secondary">{t('sent')}</p> : null}
        {status === 'error' ? <p className="text-sm text-danger">{t('emailFailed')}</p> : null}
      </form>
    </section>
  );
}
