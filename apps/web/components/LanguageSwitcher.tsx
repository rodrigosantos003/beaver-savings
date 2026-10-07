'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import type { FlagComponent } from 'country-flag-icons/react/3x2';
import GB from 'country-flag-icons/react/3x2/GB';
import PT from 'country-flag-icons/react/3x2/PT';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type Locale = (typeof routing.locales)[number];

// Map each locale to a flag. Add new locales here as you add them to routing.
const FLAGS: Record<string, FlagComponent> = {
  en: GB,
  pt: PT,
};

function Flag({ locale, className }: { locale: string; className?: string }) {
  const Component = FLAGS[locale];
  if (!Component) return null;
  return <Component aria-hidden className={className} />;
}

export function LanguageSwitcher() {
  const t = useTranslations('languageSwitcher');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape
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

  function select(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

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
        <Flag locale={locale} className="h-3.5 w-5 rounded-[2px]" />
        <span className="hidden sm:inline">{t(`locales.${locale as Locale}`)}</span>
        <span className="uppercase sm:hidden">{locale}</span>
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
          {routing.locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                onClick={() => select(l)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50 ${
                  l === locale ? 'font-semibold text-stone-900' : 'text-stone-600'
                }`}
              >
                <Flag locale={l} className="h-3.5 w-5 rounded-[2px]" />
                {t(`locales.${l}`)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
