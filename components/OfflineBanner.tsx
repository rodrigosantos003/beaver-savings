'use client';

import { useTranslations } from 'next-intl';

import { useOnline } from '@/lib/hooks/useOnline';

export function OfflineBanner() {
  const t = useTranslations('offline');
  const online = useOnline();

  if (online) return null;

  return (
    <p
      role="status"
      className="bg-beaver-900 px-4 py-2 text-center text-sm font-medium text-beaver-50 print:hidden"
    >
      {t('banner')}
    </p>
  );
}
