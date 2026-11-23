'use client';

import { usePathname, useRouter } from '@/i18n/navigation';

// Sub-pages reached from somewhere else in the app. The installed iOS app has no browser
// back button, so without this the only way out is the logo.
const SUB_PAGES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/confirm-account',
  '/passkeys',
  '/delete-account',
  '/privacy-policy',
  '/terms-and-conditions',
];

export function BackButton({ label }: { label: string }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!SUB_PAGES.includes(pathname)) return null;

  function goBack() {
    // Opened straight from an email link or a fresh launch there is no in-app history to return to.
    if (window.history.length > 1) router.back();
    else router.push('/');
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={label}
      className="-ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-beaver-900 transition-colors hover:bg-stone-100 md:hidden"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>
  );
}
