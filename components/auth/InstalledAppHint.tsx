'use client';

import { useSyncExternalStore } from 'react';

import { useTranslations } from 'next-intl';

import { isStandalone } from '@/lib/pwa';

const subscribe = () => () => {};

// Email links always open in the browser; on phones the user may have come from the installed app.
const inBrowserOnPhone = () => !isStandalone() && window.matchMedia('(pointer: coarse)').matches;

export function InstalledAppHint() {
  const t = useTranslations('auth');
  const show = useSyncExternalStore(subscribe, inBrowserOnPhone, () => false);

  if (!show) return null;

  return <p className="text-sm text-stone-600">{t('installedAppHint')}</p>;
}
