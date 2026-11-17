'use client';

import { type ReactNode, useEffect, useState } from 'react';

import { usePathname } from '@/i18n/navigation';

type Props = {
  children: ReactNode;
  openLabel: string;
  closeLabel: string;
};

export function MobileMenu({ children, openLabel, closeLabel }: Props) {
  const pathname = usePathname();

  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenedOn(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpenedOn(open ? null : pathname)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-beaver-900 transition-colors hover:bg-stone-100"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-stone-200 bg-white px-4 py-4 shadow-md sm:px-6"
        >
          {children}
        </div>
      )}
    </div>
  );
}
