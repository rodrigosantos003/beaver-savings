'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { exportAccountData } from '@/lib/api/account';
import { authClient } from '@/lib/auth-client';

export function DownloadDataLink() {
  const t = useTranslations('dataExport');
  const { data: session, isPending } = authClient.useSession();
  const [status, setStatus] = useState<'idle' | 'loading' | 'failed'>('idle');

  if (isPending || !session) {
    return null;
  }

  async function download() {
    setStatus('loading');
    try {
      const data = await exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `beaver-savings-data-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus('idle');
    } catch (error) {
      console.error(error);
      setStatus('failed');
    }
  }

  return (
    <button
      type="button"
      onClick={download}
      disabled={status === 'loading'}
      className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 disabled:cursor-wait disabled:opacity-60"
    >
      {status === 'loading' ? t('downloading') : status === 'failed' ? t('failed') : t('link')}
    </button>
  );
}
