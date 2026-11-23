'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { exportAccountData } from '@/lib/api/account';
import { authClient } from '@/lib/auth-client';
import { isStandalone } from '@/lib/pwa';

/**
 * Installed apps (iOS especially) handle `<a download>` poorly, so hand the file to the native
 * share sheet ("Save to Files", AirDrop, …). Returns false when the caller should download instead.
 */
async function shareFile(file: File): Promise<boolean> {
  if (!isStandalone() || !navigator.canShare?.({ files: [file] })) return false;

  try {
    await navigator.share({ files: [file] });
    return true;
  } catch (error) {
    // AbortError: the user closed the sheet. Anything else (e.g. NotAllowedError once the tap's
    // activation has expired during the fetch) falls back to a regular download.
    return error instanceof DOMException && error.name === 'AbortError';
  }
}

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
      const name = `beaver-savings-data-${new Date().toISOString().slice(0, 10)}.json`;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

      if (await shareFile(new File([blob], name, { type: blob.type }))) {
        setStatus('idle');
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      // Revoking right away can cancel the download (Safari, some Firefox versions) because
      // the browser reads the blob asynchronously after the click; give it time first.
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
