'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';

import { CredentialsForm } from './CredentialsForm';

export function QuickLogin({ initialLoggedIn }: { initialLoggedIn: boolean }) {
  const t = useTranslations('nav');
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const loggedIn = isPending ? initialLoggedIn : !!session;

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: PointerEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  if (loggedIn) {
    return (
      <div className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          onClick={async () => {
            await authClient.signOut();
            router.refresh();
          }}
        >
          {t('signOut')}
        </button>
        <button
          type="button"
          className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
          onClick={() => router.push('/calculator')}
        >
          {t('calculator')}
        </button>
      </div>
    );
  }

  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <div className="md:relative" ref={panelRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
        onClick={() => setOpen((current) => !current)}
      >
        {t('login')}
      </button>
      {open ? (
        <div className="absolute inset-x-0 top-full z-20 border-b border-stone-200 bg-white p-4 shadow-lg md:inset-x-auto md:right-0 md:mt-2 md:w-72 md:rounded-2xl md:border">
          <CredentialsForm mode="login" compact />
        </div>
      ) : null}
    </div>
  );
}
