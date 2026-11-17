'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { useLocale, useTranslations } from 'next-intl';
import { CURRENCIES, type Currency, isCurrency } from 'savings-core';

import { authClient } from '@/lib/auth-client';

const COOKIE = 'NEXT_CURRENCY';

function writeCurrencyCookie(currency: Currency) {
  document.cookie = `${COOKIE}=${currency}; path=/; max-age=31536000; samesite=lax`;
}

export function CurrencySwitcher({
  initial,
  initialLoggedIn,
}: {
  initial: Currency;
  initialLoggedIn: boolean;
}) {
  const t = useTranslations('currencySwitcher');
  const locale = useLocale();
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [override, setOverride] = useState<Currency | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  const saved = session?.user.preferredCurrency;
  const savedCurrency = saved && isCurrency(saved) ? saved : null;
  const currency = override ?? savedCurrency ?? initial;

  useEffect(() => {
    if (override === null && savedCurrency && savedCurrency !== initial) {
      writeCurrencyCookie(savedCurrency);
      startTransition(() => router.refresh());
    }
  }, [override, savedCurrency, initial, router]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const loggedIn = session ? true : sessionPending ? initialLoggedIn : false;
  if (!loggedIn) return null;

  async function select(next: Currency) {
    setOpen(false);
    if (next === currency) return;

    const previous = currency;
    setError(null);
    setOverride(next);
    writeCurrencyCookie(next);

    const { error } = await authClient.updateUser({ preferredCurrency: next });
    if (error) {
      setOverride(previous);
      writeCurrencyCookie(previous);
      setError(t('saveFailed'));
      return;
    }

    startTransition(() => router.refresh());
  }

  const names = new Intl.DisplayNames([locale], { type: 'currency' });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('label')}
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-50"
      >
        <span>{currency}</span>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('label')}
          className="absolute right-0 z-50 mt-2 min-w-40 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {CURRENCIES.map((code) => (
            <li key={code} role="option" aria-selected={code === currency}>
              <button
                type="button"
                onClick={() => select(code)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50 ${
                  code === currency ? 'font-semibold text-stone-900' : 'text-stone-600'
                }`}
              >
                <span className="w-9">{code}</span>
                <span className="font-normal text-stone-500">{names.of(code)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p
          role="alert"
          className="absolute right-0 z-50 mt-2 w-max max-w-56 rounded-xl bg-danger px-3 py-2 text-sm text-white"
        >
          {error}
        </p>
      )}
    </div>
  );
}
