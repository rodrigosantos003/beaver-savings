'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

export function UpdatePrompt() {
  const t = useTranslations('PWAUpdate');
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const reloadRequested = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const sw = navigator.serviceWorker;
    let registration: ServiceWorkerRegistration | undefined;

    // A controller must already exist: on the very first install there is nothing to update.
    const offer = (worker: ServiceWorker | null) => {
      if (worker && sw.controller) setWaiting(worker);
    };

    const onUpdateFound = () => {
      const installing = registration?.installing;
      installing?.addEventListener('statechange', () => {
        if (installing.state === 'installed') offer(installing);
      });
    };

    // An installed app can stay open for days without a full navigation, which is
    // when the browser would normally look for a new service worker.
    const onVisible = () => {
      if (document.visibilityState === 'visible') registration?.update().catch(() => {});
    };

    const onControllerChange = () => {
      if (reloadRequested.current) window.location.reload();
    };

    sw.ready.then((ready) => {
      registration = ready;
      offer(ready.waiting);
      ready.addEventListener('updatefound', onUpdateFound);
    });
    sw.addEventListener('controllerchange', onControllerChange);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      registration?.removeEventListener('updatefound', onUpdateFound);
      sw.removeEventListener('controllerchange', onControllerChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  if (!waiting) return null;

  const reload = () => {
    reloadRequested.current = true;
    waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] z-50 flex justify-center px-4 print:hidden"
    >
      <div className="flex max-w-md items-center gap-3 rounded-full border border-border bg-surface-raised py-2 pr-2 pl-4 text-sm text-foreground shadow-lg shadow-beaver-900/15">
        <span>{t('message')}</span>
        <button
          type="button"
          onClick={reload}
          className="shrink-0 rounded-full bg-secondary px-3 py-1.5 font-semibold text-white transition-colors hover:bg-secondary-hover"
        >
          {t('reload')}
        </button>
      </div>
    </div>
  );
}
