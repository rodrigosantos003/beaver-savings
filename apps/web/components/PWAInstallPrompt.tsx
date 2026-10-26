'use client';

import { type ReactNode, useEffect, useState, useSyncExternalStore } from 'react';

import { useTranslations } from 'next-intl';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

type Platform = 'ios' | 'ipad' | 'android' | 'desktop' | 'installed' | 'snoozed' | 'server';

const DISMISS_KEY = 'pwa-install-dismissed-at';
const SNOOZE_DAYS = 14;
const SHOW_DELAY_MS = 1000;

const subscribe = () => () => {};

function readDismissedAt(): number {
  try {
    return Number(localStorage.getItem(DISMISS_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeDismissedAt() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

function getPlatform(): Platform {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true;
  if (standalone) return 'installed';

  const dismissedAt = readDismissedAt();
  if (dismissedAt && Date.now() - dismissedAt < SNOOZE_DAYS * 86_400_000) {
    return 'snoozed';
  }

  const ua = navigator.userAgent;
  const isIPhone = /iphone|ipod/i.test(ua);
  const isIPad =
    /ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS
  const isSafari = !/crios|fxios|edgios|opios/i.test(ua);

  if (isIPhone || isIPad) {
    if (!isSafari) return 'desktop'; // non-Safari iOS browsers: no prompt
    return isIPad ? 'ipad' : 'ios';
  }

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
  if (/android/i.test(ua) || isTouchDevice) return 'android';

  return 'desktop';
}

// Renders <b>...</b> tags used inside the translation strings
const bold = (chunks: ReactNode) => <b>{chunks}</b>;

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

function PlusSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

const primaryButton =
  'rounded-lg bg-secondary py-2.5 text-sm font-medium text-surface transition-colors hover:bg-secondary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

const ghostButton =
  'rounded-lg px-3 text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

export default function PWAInstallPrompt() {
  const t = useTranslations('PWAInstall');
  const platform = useSyncExternalStore<Platform>(subscribe, getPlatform, () => 'server');

  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SHOW_DELAY_MS);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setClosed(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const isIOS = platform === 'ios' || platform === 'ipad';
  const isInstallable = platform === 'android' && deferred !== null;

  if (!ready || closed || (!isIOS && !isInstallable)) return null;

  const dismiss = () => {
    writeDismissedAt();
    setClosed(true);
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'dismissed') writeDismissedAt();
    } finally {
      setDeferred(null);
      setClosed(true);
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-raised p-4 shadow-xl shadow-beaver-900/15">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="pwa-install-title" className="text-base font-semibold text-foreground">
              {t('title')}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{t('description')}</p>
          </div>
          <button
            onClick={dismiss}
            aria-label={t('close')}
            className="-mr-1 -mt-1 rounded-full p-1.5 text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {isIOS ? (
          <>
            <ol className="mt-3 space-y-2 rounded-xl bg-surface-sunken p-3 text-sm text-foreground">
              <li className="flex items-center gap-2">
                <ShareIcon className="shrink-0 text-river-500" />
                <span>{t.rich('iosStepShare', { b: bold })}</span>
              </li>
              <li className="flex items-center gap-2">
                <PlusSquareIcon className="shrink-0 text-primary" />
                <span>{t.rich('iosStepAddToHome', { b: bold })}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-xs font-bold text-secondary">
                  ✓
                </span>
                <span>{t.rich('iosStepConfirm', { b: bold })}</span>
              </li>
            </ol>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-xs text-muted">{t('iosToolbarHint')}</p>
              <button onClick={dismiss} className={ghostButton}>
                {t('gotIt')}
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4 flex gap-2">
            <button onClick={install} className={`${primaryButton} flex-1`}>
              {t('install')}
            </button>
            <button onClick={dismiss} className={ghostButton}>
              {t('notNow')}
            </button>
          </div>
        )}
      </div>

      {platform === 'ios' && (
        <div
          className="mt-1 flex justify-center text-secondary motion-safe:animate-bounce"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="m6 13 6 6 6-6" />
          </svg>
        </div>
      )}
    </div>
  );
}
