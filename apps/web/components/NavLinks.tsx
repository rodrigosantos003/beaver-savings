'use client';

import { useTranslations } from 'next-intl';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

const BACK_PAGES = ['/privacy-policy', '/terms-and-conditions', '/signup', '/login'];

export function NavLinks({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const showBack = BACK_PAGES.includes(pathname);

  if (showBack) {
    return (
      <Link
        href="/landing"
        className="text-sm font-medium text-stone-500 transition-colors hover:text-stone-900"
      >
        {t('backToHome')}
      </Link>
    );
  }

  return !hasSession ? (
    <>
      <Link
        href="/landing#features"
        className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline"
      >
        {t('features')}
      </Link>
      <Link
        href="/landing#how-it-works"
        className="hidden text-sm font-medium text-stone-500 transition-colors hover:text-stone-900 sm:inline"
      >
        {t('howItWorks')}
      </Link>
    </>
  ) : null;
}
